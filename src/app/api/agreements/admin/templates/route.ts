import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.agreementTemplate.findMany({
    where: { status: "published" },
    orderBy: [{ key: "asc" }, { version: "desc" }],
    select: { id: true, key: true, version: true, title: true, signerRoles: true, variablesSchema: true },
  });
  return NextResponse.json({ templates });
}
