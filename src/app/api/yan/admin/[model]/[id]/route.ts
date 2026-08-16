import { NextRequest, NextResponse } from "next/server";
import { getYanAdminModel } from "@/lib/yanAdminSchema";
import { getYanPrismaDelegate } from "@/lib/yanAdminDelegate";
import { coerceYanAdminBody } from "@/lib/yanAdminCoerce";

export async function PATCH(req: NextRequest, { params }: { params: { model: string; id: string } }) {
  const config = getYanAdminModel(params.model);
  const delegate = getYanPrismaDelegate(params.model);
  if (!config || !delegate) {
    return NextResponse.json({ error: "Unknown admin model." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Partial update: only coerce/validate fields actually present in the body,
  // so a quick "toggle featured" PATCH doesn't need every required field re-sent.
  const partialConfig = { ...config, fields: config.fields.filter((f) => f.name in body) };
  const { data, error } = coerceYanAdminBody(partialConfig, body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const updated = await (delegate as { update: (args: unknown) => Promise<unknown> }).update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error(`[api/yan/admin/${params.model}/${params.id}] update failed:`, err);
    return NextResponse.json({ error: "Failed to update record." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { model: string; id: string } }) {
  const config = getYanAdminModel(params.model);
  const delegate = getYanPrismaDelegate(params.model);
  if (!config || !delegate) {
    return NextResponse.json({ error: "Unknown admin model." }, { status: 404 });
  }

  try {
    await (delegate as { delete: (args: unknown) => Promise<unknown> }).delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[api/yan/admin/${params.model}/${params.id}] delete failed:`, err);
    return NextResponse.json({ error: "Failed to delete record." }, { status: 500 });
  }
}
