import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { createDraftEnrollmentFromTemplate } from "@/lib/portal/data/enrollments";
import { createMemberSchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createMemberSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  // A coach may only create members assigned to themselves.
  const coachPersonId = actor.isAdmin ? (parsed.data.coachPersonId ?? null) : actor.personId;

  try {
    const result = await createDraftEnrollmentFromTemplate({
      personEmail: parsed.data.email,
      personFirstName: parsed.data.firstName,
      personLastName: parsed.data.lastName,
      isTest: parsed.data.isTest,
      templateKey: parsed.data.templateKey,
      templateVersion: parsed.data.templateVersion,
      coachPersonId,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      paymentUrl: parsed.data.paymentUrl,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create enrollment." }, { status: 400 });
  }
}
