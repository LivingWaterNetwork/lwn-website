import { NextRequest, NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { getDocumentDownloadForActor } from "@/lib/portal/data/documents";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getPortalActor();
  if (!actor) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const download = await getDocumentDownloadForActor(actor, params.id);
  if (!download) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return new NextResponse(new Uint8Array(download.bytes), {
    status: 200,
    headers: {
      "Content-Type": download.mime,
      "Content-Disposition": `attachment; filename="${download.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
