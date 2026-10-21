import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATEMENTS, assertStatementIsSafe } from "@/lib/portal/migrationStatements";
import { seedProgramTemplatesFromContentFiles } from "@/lib/portal/data/templates";
import { bootstrapStaffRole } from "@/lib/portal/data/staff";
import {
  createDraftEnrollmentFromTemplate,
  findFirstEnrollmentIdForEmail,
  bootstrapSetEnrollmentStatus,
} from "@/lib/portal/data/enrollments";

/**
 * TEMPORARY — one-time setup for Omar's PR #18 preview review. Gated by a
 * secret only this session and Omar's request know. Applies the
 * portal-migrate.ts statements (idempotent — skips if already applied),
 * seeds program templates, grants Omar admin+coach, and creates one
 * test-flagged member enrollment. Removed once the review is done.
 */
const SETUP_KEY = "94a775d6a3a5b4582db287fa850fca8baf1dd7501ad50fa4";
const OMAR_EMAIL = "ofandino@lwnetwork.org";
const TEST_MEMBER_EMAIL = "test-member-a@example.com";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-setup-key") !== SETUP_KEY) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const results: string[] = [];

  // 1. Apply migration, if not already applied.
  let alreadyApplied = false;
  try {
    await prisma.$queryRawUnsafe(`SELECT 1 FROM "portal_persons" LIMIT 1`);
    alreadyApplied = true;
  } catch {
    alreadyApplied = false;
  }

  if (alreadyApplied) {
    results.push("migration: already applied, skipped");
  } else {
    for (const stmt of STATEMENTS) assertStatementIsSafe(stmt);
    await prisma.$transaction(async (tx) => {
      for (const stmt of STATEMENTS) {
        await tx.$executeRawUnsafe(stmt.sql);
      }
    });
    results.push(`migration: applied (${STATEMENTS.length} statements)`);
  }

  // 2. Seed program templates.
  const templateResult = await seedProgramTemplatesFromContentFiles();
  results.push(`templates: ${templateResult.created} created, ${templateResult.updated} updated, ${templateResult.noop} unchanged`);

  // 3. Seed Omar as admin + coach.
  for (const role of ["admin", "coach"] as const) {
    const roleResult = await bootstrapStaffRole({ email: OMAR_EMAIL, firstName: "Omar", lastName: "Fandino", role });
    results.push(roleResult.granted ? `staff: granted ${role} to ${OMAR_EMAIL}` : `staff: already has ${role}`);
  }

  // 4. Create one test enrollment, if one doesn't already exist for this test email.
  const existingEnrollmentId = await findFirstEnrollmentIdForEmail(TEST_MEMBER_EMAIL);
  if (existingEnrollmentId) {
    results.push(`test enrollment: already exists (${existingEnrollmentId})`);
  } else {
    const roleResult = await bootstrapStaffRole({ email: OMAR_EMAIL, firstName: "Omar", lastName: "Fandino", role: "coach" });
    const created = await createDraftEnrollmentFromTemplate({
      personEmail: TEST_MEMBER_EMAIL,
      personFirstName: "Test",
      personLastName: "Member A",
      isTest: true,
      templateKey: "lwn-coaching-business-launch-60",
      coachPersonId: roleResult.person.id,
      startDate: new Date(),
    });
    // Admin review wants to see it from the member's side, not stuck in draft.
    await bootstrapSetEnrollmentStatus(created.enrollmentId, "active");
    results.push(`test enrollment: created (${created.enrollmentId}), set to active`);
  }

  return NextResponse.json({ results });
}
