import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAgreementFromTemplate, AgreementServiceError } from "@/lib/agreements/service";
import { adminCreateAgreementSchema, firstIssueMessage } from "@/lib/agreements/validation";

/** Lists agreements for the admin dashboard. Excludes test/`test-*` records by default — pass ?includeTest=1 to see them. */
export async function GET(req: NextRequest) {
  const includeTest = req.nextUrl.searchParams.get("includeTest") === "1";
  const status = req.nextUrl.searchParams.get("status");

  const agreements = await prisma.agreement.findMany({
    where: {
      ...(includeTest ? {} : { isTest: false }),
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      template: { select: { key: true, version: true, title: true } },
      signers: { select: { role: true, name: true, status: true } },
    },
  });

  return NextResponse.json({ agreements });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = adminCreateAgreementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  try {
    const agreement = await createAgreementFromTemplate({
      templateKey: parsed.data.templateKey,
      templateVersion: parsed.data.templateVersion,
      name: parsed.data.name,
      email: parsed.data.email,
      variables: parsed.data.variables,
      signers: parsed.data.signers,
      paymentUrl: parsed.data.paymentUrl || undefined,
      expiresInDays: parsed.data.expiresInDays,
      isTest: parsed.data.isTest,
    });
    return NextResponse.json({ agreement });
  } catch (err) {
    if (err instanceof AgreementServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/agreements/admin/agreements] create failed:", err);
    return NextResponse.json({ error: "Failed to create agreement." }, { status: 500 });
  }
}
