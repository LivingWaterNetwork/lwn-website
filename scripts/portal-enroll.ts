/**
 * Creates a draft enrollment from a published (or explicitly versioned)
 * program template. Thin CLI wrapper over createDraftEnrollmentFromTemplate
 * in src/lib/portal/data/enrollments.ts — the same function the admin
 * "Create a member" form calls, so the two never drift.
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
import { createDraftEnrollmentFromTemplate } from "../src/lib/portal/data/enrollments";

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

async function main() {
  const templateKey = requireArg("template");
  const version = getArg("version");
  const email = requireArg("email");
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

  let coachPersonId: string | null = null;
  if (coachEmail) {
    const coach = await prisma.portalPerson.findUnique({ where: { email: normalizeEmail(coachEmail) } });
    if (!coach) throw new Error(`No portal_persons row for coach email ${coachEmail} — run portal:seed-staff first.`);
    coachPersonId = coach.id;
  }

  const result = await createDraftEnrollmentFromTemplate({
    personEmail: email,
    personFirstName: firstName,
    personLastName: lastName,
    isTest,
    templateKey,
    templateVersion: version,
    coachPersonId,
    startDate,
    endDate,
    paymentUrl: paymentUrlArg,
  });

  console.log(`Created draft enrollment ${result.enrollmentId} for ${email} on ${templateKey}.`);
  if (result.agreementLink === "linked") console.log(`Agreement link: linked automatically.`);
  else if (result.agreementLink === "ambiguous") console.warn(`Agreement link: more than one match — left unlinked. Link one manually from the admin.`);
  else console.log(`Agreement link: none.`);
  console.log(`Nothing was sent — invite the member yourself from /portal/admin when ready.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
