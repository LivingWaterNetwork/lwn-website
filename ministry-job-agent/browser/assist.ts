import { chromium, type Browser, type Page } from "playwright";
import { captureForm, type CapturedField } from "./capture";
import { evaluatePage, isSubmitControl, type SafetyStop, type StopReason } from "./safety";
import type { ResolvedAnswer } from "../src/lib/answers/resolver";

/**
 * The application assistant.
 *
 * What it does: opens the page, fills fields that have an APPROVED answer marked
 * auto-usable, uploads approved documents, and stops.
 *
 * What it will never do: click submit, solve a challenge, enter credentials,
 * check an attestation box, or type an answer the candidate has not approved.
 * The submit button is a hard stop — reaching it ends the run successfully with
 * a draft, and submission remains a separate, human-authorized action.
 */

export interface AssistOptions {
  url: string;
  /** Field selector -> the resolved answer for that field's question. */
  answers: Map<string, ResolvedAnswer>;
  /** Field selector -> absolute path of an approved document to upload. */
  uploads?: Map<string, string>;
  /** CAPTURE reads the form only. FILL_DRAFT fills approved answers. */
  mode: "CAPTURE" | "FILL_DRAFT";
  /** Visible browser so the candidate can watch and take over. Default true. */
  headed?: boolean;
  /** Reuse a persistent profile directory so manual logins survive between runs. */
  userDataDir?: string;
  screenshotPath?: string;
}

export interface AssistResult {
  status: "COMPLETED_DRAFT" | "PAUSED_FOR_HUMAN" | "STOPPED_SAFETY" | "FAILED";
  stopReason: StopReason | null;
  stop: SafetyStop | null;
  capturedFields: CapturedField[];
  filled: Array<{ selector: string; question: string; source: string }>;
  skipped: Array<{ selector: string; question: string; why: string }>;
  log: string[];
}

export async function runAssist(opts: AssistOptions): Promise<AssistResult> {
  const log: string[] = [];
  const filled: AssistResult["filled"] = [];
  const skipped: AssistResult["skipped"] = [];

  let browser: Browser | null = null;
  let page: Page;

  try {
    // Headed by default: the candidate should be able to see and take over.
    browser = await chromium.launch({
      headless: opts.headed === false,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    });
    const context = await browser.newContext();
    page = await context.newPage();
  } catch (err) {
    return {
      status: "FAILED",
      stopReason: "NAVIGATION_ERROR",
      stop: null,
      capturedFields: [],
      filled,
      skipped,
      log: [`Could not launch a browser: ${(err as Error).message}`],
    };
  }

  try {
    log.push(`Opening ${opts.url}`);
    const capture = await captureForm(page, opts.url);

    if (capture.stop) {
      log.push(`STOP — ${capture.stop.reason}: ${capture.stop.message}`);
      return {
        status: "STOPPED_SAFETY",
        stopReason: capture.stop.reason,
        stop: capture.stop,
        capturedFields: [],
        filled,
        skipped,
        log,
      };
    }

    log.push(`Captured ${capture.fields.length} form field(s).`);

    if (opts.mode === "CAPTURE") {
      if (opts.screenshotPath) await page.screenshot({ path: opts.screenshotPath, fullPage: true });
      return {
        status: "COMPLETED_DRAFT",
        stopReason: null,
        stop: null,
        capturedFields: capture.fields,
        filled,
        skipped,
        log,
      };
    }

    for (const field of capture.fields) {
      // Attestations and file-signature fields are never touched, full stop.
      if (field.fieldType === "ATTESTATION") {
        skipped.push({
          selector: field.selector,
          question: field.questionText,
          why: "Attestation — requires the candidate's own consent.",
        });
        continue;
      }

      const upload = opts.uploads?.get(field.selector);
      if (field.fieldType === "FILE") {
        if (upload) {
          await page.setInputFiles(field.selector, upload);
          filled.push({ selector: field.selector, question: field.questionText, source: "APPROVED_DOCUMENT" });
          log.push(`Uploaded approved document to "${field.questionText}".`);
        } else {
          skipped.push({
            selector: field.selector,
            question: field.questionText,
            why: "No approved document assigned to this upload field.",
          });
        }
        continue;
      }

      const answer = opts.answers.get(field.selector);
      if (!answer || answer.resolution !== "RESOLVED" || !answer.answerText) {
        skipped.push({
          selector: field.selector,
          question: field.questionText,
          why: answer?.note ?? "No approved answer for this question.",
        });
        continue;
      }
      if (!answer.autoUsable) {
        skipped.push({
          selector: field.selector,
          question: field.questionText,
          why: "Answer is approved but not marked for automatic use.",
        });
        continue;
      }

      try {
        if (field.fieldType === "SELECT") {
          await page.selectOption(field.selector, { label: answer.answerText });
        } else {
          const text =
            field.maxLength && answer.answerText.length > field.maxLength
              ? answer.answerText.slice(0, field.maxLength)
              : answer.answerText;
          if (field.maxLength && answer.answerText.length > field.maxLength) {
            log.push(
              `NOTE: truncated the answer for "${field.questionText}" to the form's ${field.maxLength}-character limit — review before approving.`,
            );
          }
          await page.fill(field.selector, text);
        }
        filled.push({
          selector: field.selector,
          question: field.questionText,
          source: answer.answerSource ?? "UNKNOWN",
        });
      } catch (err) {
        skipped.push({
          selector: field.selector,
          question: field.questionText,
          why: `Could not fill the field: ${(err as Error).message}`,
        });
      }
    }

    // Re-check the page after filling: forms reveal attestations and challenges
    // conditionally, and the state that matters is the state at the end.
    const finalText = (await page.locator("body").innerText().catch(() => "")) ?? "";
    const postFillStop = evaluatePage({ url: opts.url, textContent: finalText, matchedSelectors: [] });
    if (postFillStop) {
      log.push(`STOP after filling — ${postFillStop.reason}: ${postFillStop.message}`);
      if (opts.screenshotPath) await page.screenshot({ path: opts.screenshotPath, fullPage: true });
      return {
        status: "STOPPED_SAFETY",
        stopReason: postFillStop.reason,
        stop: postFillStop,
        capturedFields: capture.fields,
        filled,
        skipped,
        log,
      };
    }

    if (opts.screenshotPath) await page.screenshot({ path: opts.screenshotPath, fullPage: true });

    // The submit button is where the agent's job ends, by design.
    const submits = capture.submitControls.filter(isSubmitControl);
    if (submits.length > 0) {
      log.push(
        `Reached the submit control ("${submits[0]}") and stopped. Submission requires your explicit APPROVE APPLICATION.`,
      );
    }

    log.push(`Filled ${filled.length} field(s); left ${skipped.length} for you.`);

    return {
      status: skipped.length > 0 ? "PAUSED_FOR_HUMAN" : "COMPLETED_DRAFT",
      stopReason: skipped.length > 0 ? "UNAPPROVED_ANSWER" : null,
      stop: null,
      capturedFields: capture.fields,
      filled,
      skipped,
      log,
    };
  } catch (err) {
    log.push(`Navigation failed: ${(err as Error).message}`);
    return {
      status: "FAILED",
      stopReason: "NAVIGATION_ERROR",
      stop: null,
      capturedFields: [],
      filled,
      skipped,
      log,
    };
  } finally {
    // Left open on purpose when a human needs to take over.
    if (browser && opts.headed === false) await browser.close();
  }
}
