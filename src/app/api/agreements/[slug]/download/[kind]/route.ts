import { NextRequest, NextResponse } from "next/server";
import { requireAgreementSession } from "@/lib/agreements/requestHelpers";
import { logAgreementEvent } from "@/lib/agreements/events";
import {
  generateAgreementPdfBuffer,
  generateAndStoreAgreementPdf,
  getLatestAgreementDocument,
  type AgreementPdfKind,
} from "@/lib/pdf/agreements/generateAgreementPdf";

const VALID_KINDS: AgreementPdfKind[] = ["draft", "participant_signed", "executed"];

/**
 * Every PDF download goes through this one authenticated route — never a
 * public URL. The kind requested must also make sense for the agreement's
 * current state, so a participant can't fetch an "executed" copy before LWN
 * has actually countersigned.
 */
export async function GET(req: NextRequest, { params }: { params: { slug: string; kind: string } }) {
  const resolved = await requireAgreementSession(req, params.slug);
  if ("error" in resolved) return resolved.error;
  const { agreement } = resolved;

  let kind = params.kind as AgreementPdfKind;
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown document kind." }, { status: 400 });
  }

  if (!agreement.renderedBody) {
    return NextResponse.json({ error: "This agreement hasn't been finalized yet." }, { status: 409 });
  }

  // LWN/MMG can presign before the participant, so her signature can be the
  // one that completes execution — a "participant_signed" snapshot never
  // gets generated in that case (it would misleadingly say "awaiting
  // countersignature" when nothing is actually awaiting). Serve the executed
  // copy instead so an old link/button never 409s once it's done.
  if (kind === "participant_signed" && agreement.status === "executed") {
    kind = "executed";
  }

  const participant = agreement.signers.find((s) => s.role === "participant");

  if (kind === "participant_signed" && participant?.status !== "signed") {
    return NextResponse.json({ error: "Not signed yet." }, { status: 409 });
  }
  if (kind === "executed" && agreement.status !== "executed") {
    return NextResponse.json({ error: "Not fully executed yet." }, { status: 409 });
  }

  let bytes: Buffer;
  if (kind === "draft") {
    bytes = await generateAgreementPdfBuffer(agreement.id, "draft");
  } else {
    const cached = await getLatestAgreementDocument(agreement.id, kind);
    if (cached) {
      bytes = Buffer.from(cached.bytes);
    } else {
      const doc = await generateAndStoreAgreementPdf(agreement.id, kind);
      bytes = Buffer.from(doc.bytes);
    }
  }

  await logAgreementEvent(req, agreement.id, "downloaded", { actorRole: "participant", detail: kind });

  return new NextResponse(new Blob([Uint8Array.from(bytes)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${agreement.slug}-${kind}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
