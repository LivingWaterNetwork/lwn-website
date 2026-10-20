import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueAccessCode } from "@/lib/agreements/service";
import { logAgreementEvent } from "@/lib/agreements/events";

/** Generates the access code (shown once) and marks the agreement "sent". Never emails anyone — LWN sends the link/code to the participant themselves. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    include: { signers: true, template: true },
  });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (agreement.status !== "ready") {
    return NextResponse.json({ error: `Agreement must be "ready" first (currently "${agreement.status}").` }, { status: 409 });
  }

  const signerRoles = agreement.template.signerRoles as Array<{ role: string; requiredBeforeSend?: boolean }>;
  const requiredRoles = signerRoles.filter((r) => r.requiredBeforeSend).map((r) => r.role);
  const unmet = agreement.signers.filter((s) => requiredRoles.includes(s.role) && s.status !== "signed");
  if (unmet.length > 0) {
    return NextResponse.json(
      { error: `Still needs: ${unmet.map((s) => s.role).join(", ")} acceptance before it can be sent.` },
      { status: 409 }
    );
  }

  const code = await issueAccessCode(agreement.id);
  await prisma.agreement.update({ where: { id: agreement.id }, data: { status: "sent" } });
  await logAgreementEvent(req, agreement.id, "sent", { actorRole: "admin" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
  return NextResponse.json({
    success: true,
    url: `${siteUrl}/agreements/${agreement.slug}`,
    code,
  });
}
