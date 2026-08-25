import type { Page } from "playwright";
import { CAPTCHA_SELECTORS, evaluatePage, isSubmitControl, type SafetyStop } from "./safety";

/**
 * Form capture.
 *
 * The capture pass is read-only: it opens a job application page, records what
 * the form asks, and leaves. Nothing is typed and nothing is clicked. Its output
 * feeds the answer resolver, which decides what (if anything) can be filled.
 */

export interface CapturedField {
  selector: string;
  questionText: string;
  fieldType: "TEXT" | "TEXTAREA" | "SELECT" | "RADIO" | "CHECKBOX" | "FILE" | "DATE" | "ATTESTATION";
  required: boolean;
  options: string[];
  maxLength: number | null;
}

export interface CaptureResult {
  url: string;
  fields: CapturedField[];
  submitControls: string[];
  stop: SafetyStop | null;
  screenshotPath?: string;
}

/** Read a page's form structure without interacting with it. */
export async function captureForm(page: Page, url: string): Promise<CaptureResult> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });

  const matchedSelectors: string[] = [];
  for (const sel of CAPTCHA_SELECTORS) {
    if ((await page.locator(sel).count()) > 0) matchedSelectors.push(sel);
  }
  const textContent = (await page.locator("body").innerText().catch(() => "")) ?? "";

  const stop = evaluatePage({ url, textContent, matchedSelectors });
  if (stop) return { url, fields: [], submitControls: [], stop };

  const fields = await page.evaluate(() => {
    /** Find the human-readable question for a control. */
    function labelFor(el: Element): string {
      const id = el.getAttribute("id");
      if (id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lbl?.textContent?.trim()) return lbl.textContent.trim();
      }
      const wrapping = el.closest("label");
      if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
      const aria = el.getAttribute("aria-label");
      if (aria) return aria;
      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const target = document.getElementById(labelledBy);
        if (target?.textContent?.trim()) return target.textContent.trim();
      }
      const placeholder = el.getAttribute("placeholder");
      if (placeholder) return placeholder;
      return el.getAttribute("name") ?? "(unlabeled field)";
    }

    function cssPath(el: Element): string {
      const id = el.getAttribute("id");
      if (id) return `#${CSS.escape(id)}`;
      const name = el.getAttribute("name");
      if (name) return `${el.tagName.toLowerCase()}[name="${name}"]`;
      const parent = el.parentElement;
      if (!parent) return el.tagName.toLowerCase();
      const idx = Array.from(parent.children).indexOf(el) + 1;
      return `${el.tagName.toLowerCase()}:nth-child(${idx})`;
    }

    const out: Array<Record<string, unknown>> = [];
    const controls = document.querySelectorAll("input, textarea, select");

    controls.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute("type") ?? "text").toLowerCase();
      if (["hidden", "submit", "button", "image", "reset"].includes(type)) return;

      let fieldType = "TEXT";
      if (tag === "textarea") fieldType = "TEXTAREA";
      else if (tag === "select") fieldType = "SELECT";
      else if (type === "radio") fieldType = "RADIO";
      else if (type === "checkbox") fieldType = "CHECKBOX";
      else if (type === "file") fieldType = "FILE";
      else if (type === "date") fieldType = "DATE";

      const question = labelFor(el);

      // A checkbox whose label reads like a promise is an attestation, not a field.
      if (
        fieldType === "CHECKBOX" &&
        /(agree|certify|attest|affirm|consent|acknowledge|confirm|statement of faith|covenant)/i.test(question)
      ) {
        fieldType = "ATTESTATION";
      }

      const options: string[] = [];
      if (tag === "select") {
        el.querySelectorAll("option").forEach((o) => {
          const t = o.textContent?.trim();
          if (t) options.push(t);
        });
      }

      const maxLengthAttr = el.getAttribute("maxlength");
      out.push({
        selector: cssPath(el),
        questionText: question.replace(/\s+/g, " ").trim(),
        fieldType,
        required: el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
        options,
        maxLength: maxLengthAttr ? Number(maxLengthAttr) : null,
      });
    });

    return out;
  });

  const submitControls = await page.evaluate(() => {
    const labels: string[] = [];
    document.querySelectorAll("button, input[type=submit], a[role=button]").forEach((el) => {
      const t = (el.textContent ?? (el as HTMLInputElement).value ?? "").trim();
      if (t) labels.push(t);
    });
    return labels;
  });

  return {
    url,
    fields: dedupeRadioGroups(fields as unknown as CapturedField[]),
    submitControls: submitControls.filter(isSubmitControl),
    stop: null,
  };
}

/** Radio groups produce one control per option; collapse them into one question. */
function dedupeRadioGroups(fields: CapturedField[]): CapturedField[] {
  const seen = new Map<string, CapturedField>();
  const out: CapturedField[] = [];

  for (const f of fields) {
    if (f.fieldType !== "RADIO") {
      out.push(f);
      continue;
    }
    const groupKey = f.selector.replace(/:nth-child\(\d+\)$/, "");
    const existing = seen.get(groupKey);
    if (existing) {
      existing.options.push(f.questionText);
      continue;
    }
    const grouped = { ...f, options: [f.questionText] };
    seen.set(groupKey, grouped);
    out.push(grouped);
  }
  return out;
}
