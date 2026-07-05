import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDonationLetterPdf } from "@/lib/pdf/generateDonationLetter";
import { sendGraphMail, graphMailConfigured } from "@/lib/graphMail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THANK_YOU_FROM = "ofandino@lwnetwork.org";

/**
 * Daily cron (see vercel.json) — finds donations completed 7+ days ago that
 * haven't yet received the personal PDF thank-you letter, generates one per
 * donation, and emails it from ofandino@lwnetwork.org via Microsoft Graph.
 *
 * This is DELIBERATELY separate from the instant plain-text receipt already
 * sent by the Stripe webhook (src/lib/email.ts sendDonationReceipt) — that
 * one satisfies the immediate IRS written-acknowledgment need; this one is a
 * warmer, personal follow-up a week later.
 *
 * Protect this endpoint in production by setting CRON_SECRET in Vercel env
 * vars — Vercel's own cron invocations send `Authorization: Bearer
 * ${CRON_SECRET}` automatically when that env var is set.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[cron/send-thank-you-letters] CRON_SECRET is not set — this endpoint is running WITHOUT auth protection. Set CRON_SECRET in Vercel env vars before relying on this in production."
    );
  }

  if (!graphMailConfigured()) {
    console.error("[cron/send-thank-you-letters] Microsoft Graph is not configured (MS_TENANT_ID/MS_CLIENT_ID/MS_CLIENT_SECRET) — cannot send letters.");
    return NextResponse.json({ error: "Graph mail not configured" }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  const eligibleDonations = await prisma.donation.findMany({
    where: {
      status: "completed",
      thankYouLetterSentAt: null,
      createdAt: { lte: cutoff },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const donation of eligibleDonations) {
    try {
      const pdfBuffer = await generateDonationLetterPdf({
        name: donation.name || "Friend",
        amount: donation.amount,
        frequency: donation.frequency,
        date: donation.createdAt,
      });

      await sendGraphMail({
        to: donation.email,
        from: THANK_YOU_FROM,
        subject: "A personal thank-you from Omar — Living Water Network",
        text: `Dear ${donation.name || "Friend"},\n\nThank you again for your generous gift to Living Water Network. Please see the attached letter — it's a small way of saying how much your partnership means, and it also serves as your official record of the gift for tax purposes.\n\nWith gratitude,\nOmar J. Fandino\nFounder, Living Water Network`,
        attachments: [
          {
            filename: "LWN-Thank-You-Letter.pdf",
            contentType: "application/pdf",
            contentBytes: pdfBuffer.toString("base64"),
          },
        ],
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: { thankYouLetterSentAt: new Date() },
      });

      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`[cron/send-thank-you-letters] Failed for donation ${donation.id}:`, err);
      // Continue to the next donation rather than aborting the whole batch.
    }
  }

  return NextResponse.json({ processed: eligibleDonations.length, sent, failed });
}
