import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agreementSessionCookieName, isValidAgreementSessionToken } from "./session";

/**
 * Resolves the agreement strictly from the route's own slug, then checks the
 * session cookie was issued for that exact agreement id. This is the single
 * choke point enforcing per-agreement isolation for every signer-facing API
 * route — never resolve an agreement from anything the client sends in the
 * body or query string.
 */
export async function requireAgreementSession(req: NextRequest, slug: string) {
  const agreement = await prisma.agreement.findUnique({ where: { slug }, include: { template: true, signers: true } });
  if (!agreement) {
    return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) } as const;
  }

  const token = req.cookies.get(agreementSessionCookieName(agreement.slug))?.value;
  const valid = await isValidAgreementSessionToken(token, agreement.id).catch(() => false);
  if (!valid) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) } as const;
  }

  return { agreement } as const;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
