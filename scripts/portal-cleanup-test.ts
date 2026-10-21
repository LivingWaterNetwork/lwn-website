/**
 * Deletes every test-only portal record: all portal_persons with
 * is_test = true, every enrollment belonging to one of them (or itself
 * flagged is_test), and everything hanging off those enrollments/persons.
 * Prints a before/after count and fails loudly if anything test-flagged
 * survives.
 *
 * This script runs DELETE statements by design — unlike
 * scripts/portal-migrate.ts (which only ever creates portal_* tables and
 * refuses DML entirely), this one exists specifically to remove QA data.
 * It only ever touches rows tied to is_test = true; nothing else.
 *
 * Usage: npm run portal:cleanup-test
 */
import { prisma } from "../src/lib/prisma";
import { hmacHex, normalizeEmail } from "../src/lib/portal/crypto";

async function countTestRows() {
  const testPersons = await prisma.portalPerson.findMany({ where: { isTest: true }, select: { id: true, email: true } });
  const testPersonIds = testPersons.map((p) => p.id);
  const enrollments = await prisma.portalEnrollment.findMany({
    where: { OR: [{ isTest: true }, { personId: { in: testPersonIds } }] },
    select: { id: true },
  });
  return { testPersons, enrollmentIds: enrollments.map((e) => e.id) };
}

async function main() {
  const before = await countTestRows();
  console.log(
    `Found ${before.testPersons.length} test person(s) and ${before.enrollmentIds.length} test enrollment(s).`
  );

  if (before.testPersons.length === 0 && before.enrollmentIds.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  const enrollmentIds = before.enrollmentIds;
  const personIds = before.testPersons.map((p) => p.id);

  const documents = await prisma.portalDocument.findMany({
    where: { enrollmentId: { in: enrollmentIds } },
    select: { id: true },
  });
  await prisma.portalDocumentBlob.deleteMany({ where: { documentId: { in: documents.map((d) => d.id) } } });
  await prisma.portalDocument.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });

  await prisma.portalEvent.deleteMany({
    where: { OR: [{ enrollmentId: { in: enrollmentIds } }, { actorPersonId: { in: personIds } }] },
  });
  await prisma.portalInstallment.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
  await prisma.portalPartnerGrant.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
  await prisma.portalActionStep.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });

  const meetings = await prisma.portalMeeting.findMany({
    where: { enrollmentId: { in: enrollmentIds } },
    select: { id: true },
  });
  await prisma.portalMeetingPrivateNote.deleteMany({ where: { meetingId: { in: meetings.map((m) => m.id) } } });
  await prisma.portalMeeting.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
  await prisma.portalPhase.deleteMany({ where: { enrollmentId: { in: enrollmentIds } } });
  await prisma.portalEnrollment.deleteMany({ where: { id: { in: enrollmentIds } } });

  await prisma.portalSession.deleteMany({ where: { personId: { in: personIds } } });
  await prisma.portalStaffRole.deleteMany({ where: { personId: { in: personIds } } });
  await prisma.portalPartnerUser.deleteMany({ where: { personId: { in: personIds } } });

  // Login challenges/throttle rows are keyed by HMAC(secret, email), not by
  // personId — re-derive the hash for each test person to find their rows.
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (secret) {
    for (const person of before.testPersons) {
      const emailHash = hmacHex(secret, normalizeEmail(person.email));
      await prisma.portalLoginChallenge.deleteMany({ where: { emailHash } });
      await prisma.portalLoginThrottle.deleteMany({
        where: { key: { in: [`request:${emailHash}`, `lockout:${emailHash}`] } },
      });
    }
  } else {
    console.warn("PORTAL_SESSION_SECRET not set — skipping login challenge/throttle cleanup for test emails.");
  }

  await prisma.portalPerson.deleteMany({ where: { id: { in: personIds } } });

  const after = await countTestRows();
  console.log(`After cleanup: ${after.testPersons.length} test person(s), ${after.enrollmentIds.length} test enrollment(s).`);
  if (after.testPersons.length > 0 || after.enrollmentIds.length > 0) {
    throw new Error("Cleanup did not remove every test record — investigate before QA is considered done.");
  }
  console.log("Confirmed: no test records remain.");
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
