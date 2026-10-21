import { NextRequest } from "next/server";
import { sendPortalEmail, sendPortalNotificationEmail } from "@/lib/email";

// Omar's own address — the only real recipient allowed in Preview while he
// QAs the portal (clarification: "Block all other real recipients during
// preview QA"). is_test records never send regardless of environment.
const PREVIEW_ALLOWED_EMAIL = "ofandino@lwnetwork.org";

export interface PortalEmailGate {
  send: boolean;
  skipReason?: "test_record" | "preview_non_allowlisted";
}

export function gatePortalEmail(params: { email: string; isTest: boolean }): PortalEmailGate {
  if (params.isTest) return { send: false, skipReason: "test_record" };
  if (process.env.VERCEL_ENV === "preview" && params.email.toLowerCase() !== PREVIEW_ALLOWED_EMAIL) {
    return { send: false, skipReason: "preview_non_allowlisted" };
  }
  return { send: true };
}

/**
 * Builds the base URL for a magic link. In Preview this must be the
 * preview deployment's own origin (the request's own host), never
 * NEXT_PUBLIC_SITE_URL (production) — otherwise a preview-QA login link
 * would open on the live production site. In Production it's the
 * canonical site URL.
 */
export function getPortalOrigin(req: NextRequest): string {
  if (process.env.VERCEL_ENV === "production") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  }
  return req.nextUrl.origin;
}

export async function sendPortalLoginEmail(params: {
  email: string;
  isTest: boolean;
  code: string;
  linkUrl: string;
}): Promise<void> {
  const gate = gatePortalEmail({ email: params.email, isTest: params.isTest });
  if (!gate.send) {
    console.log(`[portal/notify] skipping login email (${gate.skipReason}) — no recipient logged`);
    return;
  }
  await sendPortalEmail({
    to: params.email,
    subject: "Your LWN sign-in code",
    text: `Rooted in truth. Sent to lead.\n\nYour sign-in code is ${params.code}. It expires in 10 minutes and works once.\n\nOr just tap this link: ${params.linkUrl}\n\nIf you didn't request this, you can ignore this email.`,
  });
}

/** Repeated-lockout alert to NOTIFY_EMAIL. Never includes a code, link token, or any member data — just that lockouts are happening. */
export async function sendPortalLockoutAlert(params: { lockoutCount: number }): Promise<void> {
  await sendPortalNotificationEmail({
    subject: "LWN portal — repeated sign-in lockouts",
    text: `There have been ${params.lockoutCount} portal sign-in lockouts recently. No codes, links, or member details are included in this alert.`,
  });
}
