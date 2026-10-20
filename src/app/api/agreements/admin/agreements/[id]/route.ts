import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { substituteVariables, markdownToSafeHtml, fillSystemTokens } from "@/lib/agreements/render";
import { computeEffectiveDate } from "@/lib/agreements/effectiveDate";

/** Detail view for one agreement — scoped strictly to the :id in the route, so an admin export of A can never include B. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    include: {
      template: true,
      signers: { orderBy: { order: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
      documents: { select: { id: true, kind: true, version: true, sha256: true, createdAt: true } },
    },
  });

  if (!agreement) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let previewHtml: string | null = null;
  let unresolvedTokens: string[] = [];

  if (agreement.renderedBody) {
    const effectiveDate = computeEffectiveDate(agreement.signers);
    previewHtml = markdownToSafeHtml(
      fillSystemTokens(agreement.renderedBody, {
        effectiveDate,
        signers: agreement.signers.map((s) => ({
          role: s.role,
          name: s.name,
          title: s.title,
          status: s.status,
          signedAt: s.signedAt,
          typedName: s.typedName,
        })),
      })
    );
  } else {
    // Draft — not frozen yet. Render a live preview from the current
    // variables so the admin can check it before marking ready; unresolved
    // tokens are surfaced explicitly rather than silently left in the text.
    const { body, unresolved } = substituteVariables(agreement.template.body, agreement.variables as Record<string, unknown>);
    unresolvedTokens = unresolved;
    previewHtml = markdownToSafeHtml(body);
  }

  return NextResponse.json({ agreement, previewHtml, unresolvedTokens });
}
