import { NextRequest, NextResponse } from "next/server";
import { getYanAdminModel } from "@/lib/yanAdminSchema";
import { getYanPrismaDelegate } from "@/lib/yanAdminDelegate";
import { coerceYanAdminBody } from "@/lib/yanAdminCoerce";

export async function GET(_req: NextRequest, { params }: { params: { model: string } }) {
  const config = getYanAdminModel(params.model);
  const delegate = getYanPrismaDelegate(params.model);
  if (!config || !delegate) {
    return NextResponse.json({ error: "Unknown admin model." }, { status: 404 });
  }

  const items = await (delegate as { findMany: (args: unknown) => Promise<unknown[]> }).findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { model: string } }) {
  const config = getYanAdminModel(params.model);
  const delegate = getYanPrismaDelegate(params.model);
  if (!config || !delegate) {
    return NextResponse.json({ error: "Unknown admin model." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { data, error } = coerceYanAdminBody(config, body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const created = await (delegate as { create: (args: unknown) => Promise<unknown> }).create({ data });
    return NextResponse.json({ item: created });
  } catch (err) {
    console.error(`[api/yan/admin/${params.model}] create failed:`, err);
    return NextResponse.json({ error: "Failed to create record — check required/unique fields." }, { status: 500 });
  }
}
