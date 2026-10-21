import { NextResponse } from "next/server";
import { getPortalActor } from "@/lib/portal/auth";
import { buildMemberDataExportZip } from "@/lib/portal/data/export";

export async function GET() {
  const actor = await getPortalActor();
  if (!actor) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const zip = await buildMemberDataExportZip(actor);

  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="lwn-portal-data.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
