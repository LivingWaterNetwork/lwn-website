import { NextRequest, NextResponse } from "next/server";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { logAgreementEvent } from "@/lib/agreements/events";
import { confirmIdentitySchema, firstIssueMessage } from "@/lib/agreements/validation";

/**
 * Server-side identity confirmation. This is a friendly speed bump, not a
 * substitute for the access code itself — anyone with the code and link can
 * already reach this agreement, so this step confirms "yes, this is the
 * right person's inbox," not "this person is who they claim to be." The
 * consent route refuses to proceed until this event exists, so the check
 * can't be bypassed by skipping the client-side screen.
 */
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const resolved = await requireAgreementSession(req, params.slug);
  if ("error" in resolved) return resolved.error;
  const { agreement } = resolved;

  const participant = agreement.signers.find((s) => s.role === "participant");
  if (!participant) {
    return NextResponse.json({ error: "Agreement is misconfigured." }, { status: 500 });
  }
  if (participant.status === "signed") {
    return NextResponse.json({ error: "This agreement has already been signed." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = confirmIdentitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  if (parsed.data.email.trim().toLowerCase() !== participant.email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "That doesn't match the email we have on file. Please double-check, or reach out if something looks wrong." },
      { status: 400 }
    );
  }

  await logAgreementEvent(req, agreement.id, "identity_confirmed", { actorRole: "participant" });

  return NextResponse.json({ success: true });
}
