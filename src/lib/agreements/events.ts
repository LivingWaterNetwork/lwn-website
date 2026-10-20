import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export type AgreementEventType =
  | "created"
  | "sent"
  | "code_failed"
  | "locked_out"
  | "opened"
  | "identity_confirmed"
  | "consented"
  | "initialed"
  | "signed"
  | "countersigned"
  | "partner_accepted"
  | "downloaded"
  | "voided"
  | "regenerated_code"
  | "extended"
  | "marked_ready";

export type ActorRole = "partner" | "participant" | "organization" | "admin" | "system";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Appends one row to the agreement's audit log. This log is append-only by
 * convention — no route in this feature ever calls `update` or `delete` on
 * AgreementEvent — so it stays a faithful record even if other state later
 * gets corrected.
 */
export async function logAgreementEvent(
  req: NextRequest | null,
  agreementId: string,
  type: AgreementEventType,
  opts: { actorRole?: ActorRole; detail?: string } = {}
): Promise<void> {
  await prisma.agreementEvent.create({
    data: {
      agreementId,
      type,
      actorRole: opts.actorRole ?? "system",
      detail: opts.detail,
      ip: req ? getClientIp(req) : null,
      userAgent: req?.headers.get("user-agent") ?? null,
    },
  });
}
