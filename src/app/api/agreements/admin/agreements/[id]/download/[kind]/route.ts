import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAgreementEvent } from "@/lib/agreements/events";
import {
  generateAgreementPdfBuffer,
  generateAndStoreAgreementPdf,
  getLatestAgreementDocument,
  type AgreementPdfKind,
} from "@/lib/pdf/agreements/generateAgreementPdf";

const VALID_KINDS: AgreementPdfKind[] = ["draft", "participant_signed", "executed"];

export async function GET(req: NextRequest, { params }: { params: { id: string; kind: string } }) {
  const agreement = await prisma.agreement.findUnique({ where: { id: params.id } });
  if (!agreement) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let kind = params.kind as AgreementPdfKind;
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown document kind." }, { status: 400 });
  }
  if (!agreement.renderedBody) {
    return NextResponse.json({ error: "This agreement hasn't been finalized yet." }, { status: 409 });
  }

  // See the signer-facing download route for why: a "participant_signed"
  // snapshot never gets generated when LWN/MMG presigned before the
  // participant, since it would misleadingly say "awaiting countersignature."
  if (kind === "participant_signed" && agreement.status === "executed") {
    kind = "executed";
  }

  let bytes: Buffer;
  if (kind === "draft") {
    bytes = await generateAgreementPdfBuffer(agreement.id, "draft");
  } else {
    const cached = await getLatestAgreementDocument(agreement.id, kind);
    bytes = cached ? Buffer.from(cached.bytes) : Buffer.from((await generateAndStoreAgreementPdf(agreement.id, kind)).bytes);
  }

  await logAgreementEvent(req, agreement.id, "downloaded", { actorRole: "admin", detail: kind });

  return new NextResponse(new Blob([Uint8Array.from(bytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${agreement.slug}-${kind}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
