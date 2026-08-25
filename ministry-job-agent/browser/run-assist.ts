/**
 * CLI entry point for browser-assisted application preparation.
 *
 * Usage:
 *   npm run apply:assist -- --package=<id>            # capture the form only
 *   npm run apply:assist -- --package=<id> --fill     # fill approved answers
 *
 * --fill still stops at the submit button. There is no flag that submits.
 */
import { PrismaClient } from "@prisma/client";
import { runAssist } from "./assist";
import { loadResolverContext } from "../src/lib/application/package-builder";
import { resolveQuestion, type ResolvedAnswer } from "../src/lib/answers/resolver";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const packageId = args.find((a) => a.startsWith("--package="))?.split("=")[1];
  const mode = args.includes("--fill") ? "FILL_DRAFT" : "CAPTURE";
  const headless = args.includes("--headless");

  if (!packageId) {
    console.error("Usage: npm run apply:assist -- --package=<id> [--fill] [--headless]");
    process.exit(1);
  }

  const pkg = await prisma.applicationPackage.findUnique({
    where: { id: packageId },
    include: { opportunity: { include: { church: true } }, approvals: true },
  });
  if (!pkg) {
    console.error(`No application package with id ${packageId}.`);
    process.exit(1);
  }

  if (pkg.opportunity.onHold || pkg.opportunity.church.onHold) {
    console.error(`${pkg.opportunity.church.name} is on the HOLD — DO NOT APPLY list. Refusing to open the application.`);
    process.exit(1);
  }

  const url = pkg.opportunity.canonicalUrl;
  if (!url) {
    console.error("This opportunity has no canonical application URL.");
    process.exit(1);
  }

  const run = await prisma.automationRun.create({
    data: { packageId, mode, status: "RUNNING" },
  });

  console.log(`Opening ${url} in ${mode} mode.`);
  console.log("The agent will stop at any CAPTCHA, login, verification, attestation, or the submit button.\n");

  // First pass captures the form so questions can be resolved before filling.
  const capture = await runAssist({ url, answers: new Map(), mode: "CAPTURE", headed: !headless });

  if (capture.stop) {
    console.log(`STOPPED — ${capture.stop.reason}`);
    console.log(`  ${capture.stop.message}`);
    console.log(`  What to do: ${capture.stop.humanAction}`);
    await prisma.automationRun.update({
      where: { id: run.id },
      data: { status: "STOPPED_SAFETY", stopReason: capture.stop.reason, endedAt: new Date(), notes: capture.stop.message },
    });
    return;
  }

  console.log(`Captured ${capture.capturedFields.length} field(s):\n`);
  const ctx = await loadResolverContext(prisma);
  const answers = new Map<string, ResolvedAnswer>();
  let blocked = 0;

  for (const field of capture.capturedFields) {
    const resolved = resolveQuestion(
      {
        questionText: field.questionText,
        fieldType: field.fieldType,
        required: field.required,
        lengthHint: field.maxLength && field.maxLength < 400 ? "short" : field.fieldType === "TEXTAREA" ? "long" : undefined,
      },
      ctx,
    );
    answers.set(field.selector, resolved);

    const mark = resolved.resolution === "RESOLVED" ? "✓" : "✗";
    console.log(`  ${mark} [${resolved.resolution}] ${field.questionText}`);
    if (resolved.resolution !== "RESOLVED") {
      blocked += 1;
      console.log(`      ${resolved.note}`);

      const exists = await prisma.humanInputRequest.findFirst({
        where: { packageId, question: field.questionText, status: "OPEN" },
      });
      if (!exists) {
        await prisma.humanInputRequest.create({
          data: {
            kind:
              resolved.resolution === "THEOLOGICAL_REVIEW_REQUIRED"
                ? "THEOLOGY"
                : resolved.resolution === "ATTESTATION_REVIEW_REQUIRED"
                  ? "ATTESTATION"
                  : "APPLICATION_QUESTION",
            question: field.questionText,
            context: resolved.note,
            opportunityId: pkg.opportunityId,
            packageId,
            storeTo: resolved.theologyTopics.length ? `theology:${resolved.theologyTopics.join(",")}` : "answer_bank",
          },
        });
      }
    }
  }

  await prisma.automationRun.update({
    where: { id: run.id },
    data: {
      capturedQuestionsJson: JSON.stringify(capture.capturedFields),
      status: blocked > 0 ? "PAUSED_FOR_HUMAN" : "COMPLETED_DRAFT",
      stopReason: blocked > 0 ? "UNAPPROVED_ANSWER" : null,
      endedAt: new Date(),
    },
  });

  if (mode === "CAPTURE") {
    console.log(`\n${blocked} question(s) have no approved answer and were added to the human-input queue.`);
    console.log("Answer them at /queue, then re-run with --fill.");
    return;
  }

  if (blocked > 0) {
    console.log(`\n${blocked} question(s) are unresolved. Refusing to fill a partial application.`);
    console.log("Answer them at /queue first.");
    return;
  }

  const fill = await runAssist({ url, answers, mode: "FILL_DRAFT", headed: !headless });
  console.log(`\n${fill.log.join("\n")}`);
  console.log(`\nStatus: ${fill.status}. The browser is left open — review every field before you submit.`);
  console.log("The agent did not and will not press submit.");

  await prisma.automationRun.update({
    where: { id: run.id },
    data: { status: fill.status === "FAILED" ? "FAILED" : fill.status, stopReason: fill.stopReason, endedAt: new Date() },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
