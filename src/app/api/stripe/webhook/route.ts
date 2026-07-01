import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";
import { addDonorToKit } from "@/lib/kit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

async function processDonation({
  stripePaymentId,
  stripeCustomerId,
  amount,
  frequency,
  name,
  email,
  comment,
}: {
  stripePaymentId: string;
  stripeCustomerId?: string;
  amount: number;
  frequency: string;
  name: string;
  email: string;
  comment?: string;
}) {
  const existing = await prisma.donation.findUnique({ where: { stripePaymentId } });
  if (existing) return; // idempotent

  const donation = await prisma.donation.create({
    data: {
      stripePaymentId,
      stripeCustomerId,
      amount,
      frequency,
      name: name || undefined,
      email,
      comment: comment || undefined,
      status: "completed",
    },
  });

  await sendDonationReceipt({ to: email, name: name || "Friend", amount, frequency, donationId: donation.id });
  await prisma.donation.update({ where: { id: donation.id }, data: { receiptSent: true } });

  // Fire-and-forget Kit sync
  addDonorToKit({ email, name: name || "Friend", amount, frequency })
    .catch((err) => console.error("[webhook] Kit sync failed:", err));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ── One-time donation ──────────────────────────────────────────────────────
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const frequency = intent.metadata?.frequency ?? "one-time";
      if (frequency !== "one-time") return NextResponse.json({ received: true }); // subscriptions handled via invoice

      await processDonation({
        stripePaymentId: intent.id,
        stripeCustomerId: typeof intent.customer === "string" ? intent.customer : undefined,
        amount: intent.amount,
        frequency,
        name: intent.metadata?.name ?? "",
        email: intent.receipt_email ?? "",
        comment: intent.metadata?.comment,
      });
    }

    // ── Recurring donation (first + renewal) ───────────────────────────────────
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) return NextResponse.json({ received: true }); // not a subscription invoice

      // Retrieve subscription to get metadata
      const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const meta = sub.metadata ?? {};
      const email = invoice.customer_email ?? "";
      const piId = typeof invoice.payment_intent === "string"
        ? invoice.payment_intent
        : (invoice.payment_intent as Stripe.PaymentIntent)?.id ?? invoice.id;

      await processDonation({
        stripePaymentId: piId,
        stripeCustomerId: typeof invoice.customer === "string" ? invoice.customer : undefined,
        amount: invoice.amount_paid,
        frequency: meta.frequency ?? "monthly",
        name: meta.name ?? "",
        email,
        comment: meta.comment,
      });
    }

    // ── Legacy: checkout.session.completed (keep for backwards compat) ─────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
      await processDonation({
        stripePaymentId: paymentId,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        amount: session.amount_total ?? 0,
        frequency: session.metadata?.frequency ?? "one-time",
        name: session.metadata?.name ?? "",
        email: session.customer_email ?? session.customer_details?.email ?? "",
        comment: session.metadata?.comment,
      });
    }
  } catch (err) {
    console.error("[webhook] processing error", err);
    // Return 200 so Stripe doesn't retry — logged above
  }

  return NextResponse.json({ received: true });
}
