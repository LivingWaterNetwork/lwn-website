import { NextResponse } from "next/server";
import { markAgreementReady, AgreementServiceError } from "@/lib/agreements/service";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const agreement = await markAgreementReady(params.id);
    return NextResponse.json({ agreement });
  } catch (err) {
    if (err instanceof AgreementServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/agreements/admin/.../ready] failed:", err);
    return NextResponse.json({ error: "Failed to mark agreement ready." }, { status: 500 });
  }
}
