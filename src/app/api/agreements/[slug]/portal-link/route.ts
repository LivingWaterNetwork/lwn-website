import { NextRequest, NextResponse } from "next/server";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { isAgreementLinkedToAnEnrollment } from "@/lib/portal/data/enrollments";

/**
 * The only place Agreements and the portal actually touch beyond the
 * read-only agreementId/agreementDocumentId FKs: tells the signer "done"
 * screen whether this agreement is linked to a portal enrollment, so it can
 * offer "Continue to your LWN space." Never signs anyone into the portal —
 * see /api/agreements/[slug]/portal-login for that.
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const result = await requireAgreementSession(req, params.slug);
  if ("error" in result) return result.error;

  const linked = await isAgreementLinkedToAnEnrollment(result.agreement.id);
  return NextResponse.json({ linked });
}
