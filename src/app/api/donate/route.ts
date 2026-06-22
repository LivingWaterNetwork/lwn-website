import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

// Maps frequency to Stripe recurring interval
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const isRecurring = frequency === "monthly" || frequency === "yearly";

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (isRecurring) {
      // Create a one-off price for the recurring amount
      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: amount,
        recurring: { interval: INTERVAL_MAP[frequency] },
        product_data: {
          name: `Living Water Network — ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation`,
        },
      });

      sessionParams = {
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        customer_email: email,
        success_url: `${siteUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/donate`,
        metadata: { name: name ?? "", comment: comment ?? "", frequency },
      };
    } else {
      sessionParams = {
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: "Living Water Network — One-Time Donation",
                description: comment || undefined,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${siteUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/donate`,
        metadata: { name: name ?? "", comment: comment ?? "", frequency: "one-time" },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("[donate/route]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
