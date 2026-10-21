/**
 * Creates a draft enrollment from a published (or explicitly versioned)
 * program template: copies the template into template_snapshot, creates
 * phases dated from the start date, placeholder sessions (no time set),
 * default action steps, and — if the template has a payments module and an
 * agreement template key — tries to auto-link an existing Agreement by
 * matching the participant's email, pulling installments from its
 * `installments` variable when exactly one match is found.
 *
 * Creates the enrollment as draft only. Never invites, never emails anyone —
 * sending is a separate, deliberate admin action.
 *
 * Usage:
 *   npm run portal:enroll -- \
 *     --template lwn-coaching-business-launch-60 \
 *     --email person@example.com --name "Full Name" \
 *     --coach-email coach@lwnetwork.org \
 *     --start 2026-10-26 --end 2026-12-24 \
 *     [--version 1.0.0] [--payment-url https://...] [--test]
 */
import { prisma } from "../src/lib/prisma";
import { normalizeEmail } from "../src/lib/portal/crypto";
import { programTemplateBodySchema } from "../src/lib/portal/programTemplates";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function requireArg(name: string): string {
  const v = getArg(name);
  if (!v) throw new Error(`Missing required --${name}`);
  return v;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const templateKey = requireArg("template");
  const version = getArg("version");
  const email = normalizeEmail(requireArg("email"));
  const name = requireArg("name");
  const coachEmail = getArg("coach-email");
  const startRaw = requireArg("start");
  const endRaw = getArg("end");
  const paymentUrlArg = getArg("payment-url");
  const isTest = hasFlag("test");

  const startDate = new Date(startRaw);
  const endDate = endRaw ? new Date(endRaw) : null;
  if (Number.isNaN(startDate.getTime())) throw new Error(`Invalid --start date: ${startRaw}`);

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "";

  const templateRow = version
    ? await prisma.portalProgramTemplate.findUnique({ where: { key_version: { key: templateKey, version } } })
    : await prisma.portalProgramTemplate.findFirst({
        where: { key: templateKey, status: "published" },
        orderBy: { version: "desc" },
      });
  if (!templateRow) {
    throw new Error(`No ${version ? "" : "published "}template found for ${templateKey}${version ? "@" + version : ""}.`);
  }
  const template = programTemplateBodySchema.parse(templateRow.body);

  const person = await prisma.portalPerson.upsert({
    where: { email },
    create: { email, firstName, lastName, isTest },
    update: {},
  });

  let coachPersonId: string | null = null;
  if (coachEmail) {
    const coach = await prisma.portalPerson.findUnique({ where: { email: normalizeEmail(coachEmail) } });
    if (!coach) throw new Error(`No portal_persons row for coach email ${coachEmail} — run portal:seed-staff first.`);
    coachPersonId = coach.id;
  }

  let agreementId: string | null = null;
  let installmentsFromAgreement: Array<{ label: string; due: string; amount: number }> = [];
  if (template.agreementTemplateKey) {
    const signers = await prisma.agreementSigner.findMany({
      where: { role: "participant", email },
      select: { agreementId: true },
    });
    const uniqueAgreementIds = Array.from(new Set(signers.map((s) => s.agreementId)));
    if (uniqueAgreementIds.length === 1) {
      agreementId = uniqueAgreementIds[0];
      const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });
      const variables = (agreement?.variables ?? {}) as Record<string, unknown>;
      const raw = variables.installments;
      if (Array.isArray(raw)) {
        installmentsFromAgreement = raw as typeof installmentsFromAgreement;
      }
    } else if (uniqueAgreementIds.length === 0) {
      console.warn(`No matching Agreements record for participant email ${email} — leaving agreement unlinked.`);
    } else {
      console.warn(
        `${uniqueAgreementIds.length} Agreements records match participant email ${email} — leaving agreement unlinked. Link one manually from the admin.`
      );
    }
  }

  const modules = Object.fromEntries(template.modules.map((m) => [m, true]));

  const enrollment = await prisma.portalEnrollment.create({
    data: {
      personId: person.id,
      templateId: templateRow.id,
      templateSnapshot: templateRow.body as object,
      coachPersonId,
      status: "draft",
      startDate,
      endDate,
      currentPhaseKey: template.phases[0]?.key ?? null,
      modules,
      agreementId,
      paymentUrl: paymentUrlArg ?? null,
      isTest,
    },
  });

  await prisma.portalPhase.createMany({
    data: template.phases.map((phase, i) => ({
      enrollmentId: enrollment.id,
      key: phase.key,
      title: phase.title,
      summary: phase.summary,
      order: i,
    })),
  });

  await prisma.portalMeeting.createMany({
    data: Array.from({ length: template.expectedSessions.count }, () => ({
      enrollmentId: enrollment.id,
      durationMin: template.expectedSessions.durationMin,
      format: "zoom",
      status: "scheduled",
    })),
  });

  await prisma.portalActionStep.createMany({
    data: template.defaultSteps.map((step, i) => ({
      enrollmentId: enrollment.id,
      phaseKey: step.phaseKey ?? null,
      title: step.title,
      detail: step.detail ?? null,
      dueOn: addDays(startDate, step.dayOffset),
      tags: step.tags,
      order: i,
      createdBy: person.id,
    })),
  });

  if (modules.payments && installmentsFromAgreement.length > 0) {
    await prisma.portalInstallment.createMany({
      data: installmentsFromAgreement.map((inst) => ({
        enrollmentId: enrollment.id,
        label: inst.label,
        dueOn: new Date(inst.due),
        amountCents: Math.round(inst.amount * 100),
      })),
    });
  }

  console.log(`Created draft enrollment ${enrollment.id} for ${email} on ${templateKey}.`);
  console.log(`Agreement link: ${agreementId ?? "none"}.`);
  console.log(`Nothing was sent — invite the member yourself from /portal/admin when ready.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
