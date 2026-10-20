import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { verifySecret } from "@/lib/agreements/crypto";
import { evaluateLoginAttempt } from "@/lib/agreements/access";
import { createAgreementSessionToken, AGREEMENT_SESSION_COOKIE } from "@/lib/agreements/session";
import { loginSchema, firstIssueMessage } from "@/lib/agreements/validation";
import { logAgreementEvent } from "@/lib/agreements/events";
import { sendAgreementsNotificationEmail } from "@/lib/email";
import { getClientIp } from "@/lib/agreements/requestHelpers";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  // Rate limited by IP (generic abuse) — the per-agreement lockout below is
  // the one that actually protects a given link from brute force.
  if (!checkRateLimit(req, "agreements-login", { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
  }

  const agreement = await prisma.agreement.findUnique({ where: { slug: params.slug } });
  if (!agreement) {
    // Same shape as a wrong code — never reveal whether a slug exists.
    return NextResponse.json({ error: "That code doesn't match." }, { status: 401 });
  }

  if (["voided", "expired"].includes(agreement.status) || (agreement.expiresAt && agreement.expiresAt < new Date())) {
    return NextResponse.json({ error: "This agreement link is no longer active." }, { status: 410 });
  }

  if (agreement.lockedUntil && agreement.lockedUntil.getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please try again later.", lockedUntil: agreement.lockedUntil },
      { status: 423 }
    );
  }

  const codeMatches = await verifySecret(parsed.data.code, agreement.accessCodeHash);
  const outcome = evaluateLoginAttempt(
    { codeAttempts: agreement.codeAttempts, lockedUntil: agreement.lockedUntil },
    codeMatches
  );

  if (outcome.outcome === "already_locked") {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please try again later.", lockedUntil: outcome.lockedUntil },
      { status: 423 }
    );
  }

  await prisma.agreement.update({
    where: { id: agreement.id },
    data: { codeAttempts: outcome.nextState.codeAttempts, lockedUntil: outcome.nextState.lockedUntil },
  });

  if (outcome.outcome === "success") {
    const token = await createAgreementSessionToken(agreement.id);
    const res = NextResponse.json({ success: true });
    res.cookies.set(AGREEMENT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h, matches the token's own TTL
    });

    const firstOpen = agreement.status === "sent";
    if (firstOpen) {
      await prisma.agreement.update({ where: { id: agreement.id }, data: { status: "viewed" } });
    }
    await logAgreementEvent(req, agreement.id, "opened", { actorRole: "participant" });

    if (firstOpen && !agreement.isTest) {
      sendAgreementsNotificationEmail({
        subject: "Agreement opened",
        text: `An agreement was opened for the first time.\n\nSigner: ${agreement.slug}\nTime: ${new Date().toISOString()}`,
      }).catch((err) => console.error("[agreements/login] notify failed:", err));
    }

    return res;
  }

  await logAgreementEvent(req, agreement.id, "code_failed", { actorRole: "participant" });

  if (outcome.outcome === "failed_now_locked") {
    await logAgreementEvent(req, agreement.id, "locked_out", { actorRole: "participant" });

    if (!agreement.isTest) {
      const priorLockouts = await prisma.agreementEvent.count({
        where: { agreementId: agreement.id, type: "locked_out" },
      });
      if (priorLockouts > 1) {
        sendAgreementsNotificationEmail({
          subject: "Agreement repeatedly locked out",
          text: `An agreement link has been locked out ${priorLockouts} times after repeated failed access codes.\n\nAgreement: ${agreement.slug}\nIP: ${getClientIp(req)}`,
        }).catch((err) => console.error("[agreements/login] notify failed:", err));
      }
    }

    return NextResponse.json(
      { error: "Too many incorrect attempts. Please try again in 15 minutes.", lockedUntil: outcome.lockedUntil },
      { status: 423 }
    );
  }

  return NextResponse.json(
    { error: "That code doesn't match.", attemptsRemaining: outcome.attemptsRemaining },
    { status: 401 }
  );
}
