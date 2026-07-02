import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

const INTERVAL_MAP: Record<string, Stripe.PriceCreateParams.Recurring.Interval> = {
  monthly: "month",
  yearly: "year",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, frequency, name, email, comment } = body;

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum donation is $1." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const isRecurring = frequency === "monthly" || frequency === "yearly";
    const meta = { name: name ?? "", comment: comment ?? "", frequency: isRecurring ? frequency : "one-time" };

    if (!isRecurring) {
      // One-time donation: PaymentIntent
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        receipt_email: email,
        metadata: meta,
        automatic_payment_methods: { enabled: true },
      });
      return NextResponse.json({ clientSecret: intent.client_secret });
    }

    // Recurring donation: Customer + Subscription
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: meta,
    });

    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: amount,
      recurring: { interval: INTERVAL_MAP[frequency] },
      product_data: {
        name: `Living Water Network — ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation`,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: meta,
    });

    const pi = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error("[donate/route]", err);
    return NextResponse.json({ error: "Failed to create payment." }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

const INTERVAL_MAP: Record<string, Stripe.PriceCreateParams.Recurring.Interval> = {
  monthly: "month",
  yearly: "year",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, frequency, name, email, comment } = body;

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum donation is $1." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const isRecurring = frequency === "monthly" || frequency === "yearly";
    const meta = { name: name ?? "", comment: comment ?? "", frequency: isRecurring ? frequency : "one-time" };

    if (!isRecurring) {
      // One-time donation: PaymentIntent
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        receipt_email: email,
        metadata: meta,
      });
      return NextResponse.json({ clientSecret: intent.client_secret });
    }

    // Recurring donation: Customer + Subscription
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: meta,
    });

    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: amount,
      recurring: { interval: INTERVAL_MAP[frequency] },
      product_data: {
        name: `Living Water Network — ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation`,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: meta,
    });

    const pi = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;

    return NextResponse.json({ clientSecret: pi.client_secret });
  } catch (err) {
    console.error("[donate/route]", err);
    return NextResponse.json({ error: "Failed to create payment." }, { status: 500 });
  }
}
