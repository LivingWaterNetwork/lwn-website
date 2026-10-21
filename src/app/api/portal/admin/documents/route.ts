import { NextRequest, NextResponse } from "next/server";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { uploadDocumentForStaff } from "@/lib/portal/data/documents";
import { DocumentValidationError } from "@/lib/portal/documentValidation";
import { hasValidOrigin } from "@/lib/portal/request";

const ALLOWED_KINDS = ["agreement", "worksheet", "curriculum", "brand_website", "other"] as const;

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const actor = await getPortalActor();
  if (!actor || !isStaff(actor)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });

  const file = form.get("file");
  const title = form.get("title");
  const kind = form.get("kind");
  const enrollmentIdRaw = form.get("enrollmentId");
  const visibleToMember = form.get("visibleToMember") === "true";

  if (!(file instanceof File) || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "A file and title are required." }, { status: 400 });
  }
  if (typeof kind !== "string" || !(ALLOWED_KINDS as readonly string[]).includes(kind)) {
    return NextResponse.json({ error: "Invalid document kind." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const document = await uploadDocumentForStaff(actor, {
      enrollmentId: typeof enrollmentIdRaw === "string" && enrollmentIdRaw ? enrollmentIdRaw : null,
      title: title.trim(),
      filename: file.name,
      kind: kind as (typeof ALLOWED_KINDS)[number],
      bytes,
      visibleToMember,
    });
    if (!document) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ document: { id: document.id, title: document.title } });
  } catch (err) {
    if (err instanceof DocumentValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
