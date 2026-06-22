import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const amountTotal = session.amount_total ?? 0;
      const email = session.customer_email ?? session.customer_details?.email ?? "";
      const name = (session.metadata?.name as string) ?? "";
      const comment = (session.metadata?.comment as string) ?? "";
      const frequency = (session.metadata?.frequency as string) ?? "one-time";
      const paymentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;

      const existing = await prisma.donation.findUnique({
        where: { stripePaymentId: paymentId },
      });

      if (!existing) {
        const donation = await prisma.donation.create({
          data: {
            stripePaymentId: paymentId,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : undefined,
            amount: amountTotal,
            frequency,
            name: name || undefined,
            email,
            comment: comment || undefined,
            status: "completed",
          },
        });

        await sendDonationReceipt({
          to: email,
          name: name || "Friend",
          amount: amountTotal,
          frequency,
          donationId: donation.id,
        });

        await prisma.donation.update({
          where: { id: donation.id },
          data: { receiptSent: true },
        });
      }
    }
  } catch (err) {
    console.error("[webhook] processing error", err);
    // Return 200 so Stripe doesn't retry — log and investigate separately
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
