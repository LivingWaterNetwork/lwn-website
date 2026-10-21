/**
 * Seeds Omar as the portal's first (and, at launch, only) staff member —
 * admin and coach both. Run by Omar himself, never by a migration:
 *   npm run portal:seed-staff
 *
 * Idempotent: re-running it when Omar already has both roles is a no-op.
 */
import { prisma } from "../src/lib/prisma";

const OMAR_EMAIL = "ofandino@lwnetwork.org";

async function main() {
  const person = await prisma.portalPerson.upsert({
    where: { email: OMAR_EMAIL },
    create: { email: OMAR_EMAIL, firstName: "Omar", lastName: "Fandino", isTest: false, status: "active" },
    update: {},
  });
  console.log(`portal_persons: ${person.id} (${person.email})`);

  for (const role of ["admin", "coach"] as const) {
    const existing = await prisma.portalStaffRole.findFirst({
      where: { personId: person.id, role, revokedAt: null },
    });
    if (existing) {
      console.log(`= already has role "${role}"`);
      continue;
    }
    await prisma.portalStaffRole.create({
      data: { personId: person.id, role, grantedBy: person.id },
    });
    console.log(`+ granted role "${role}"`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
