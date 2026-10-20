import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";

/** Re-copy the invite link (the access code was already shown once at send/regenerate time and isn't recoverable — regenerate it instead if it's been lost). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agreement = await prisma.agreement.findUnique({ where: { id: params.id } });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!agreement.accessCodeHash) {
    return NextResponse.json({ error: "This agreement hasn't been sent yet." }, { status: 409 });
  }

  await logAgreementEvent(req, agreement.id, "sent", { actorRole: "admin", detail: "resend" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
  return NextResponse.json({
    success: true,
    url: `${siteUrl}/agreements/${agreement.slug}`,
    note: "The access code was only shown once, at send/regenerate time. If it's been lost, use \"Regenerate code\" instead.",
  });
}
