import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { setDocumentVisibilityForStaff } from "@/lib/portal/data/documents";
import { documentVisibilitySchema, firstIssueMessage } from "@/lib/portal/adminValidation";
import { hasValidOrigin } from "@/lib/portal/request";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = documentVisibilitySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });

  const updated = await setDocumentVisibilityForStaff(actor, params.id, parsed.data.visibleToMember);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ document: updated });
}
