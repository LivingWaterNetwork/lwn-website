"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 5000, 10000];
type Frequency = "one-time" | "monthly" | "yearly";

// ─── Step 2: Payment Element ──────────────────────────────────────────────────
interface PaymentStepProps {
  clientSecret: string;
  amount: number;
  frequency: Frequency;
  onBack: () => void;
}

function PaymentStep({ clientSecret, amount, frequency, onBack }: PaymentStepProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Guard against React Strict Mode double-invoke and re-runs
    if (!clientSecret || elementsRef.current) return;

    stripePromise
      .then((stripe) => {
        if (!stripe) {
          setError("Payment processor unavailable. Please try again or contact us at info@lwnetwork.org.");
          return;
        }
        if (!mountRef.current || elementsRef.current) return;
        stripeRef.current = stripe;
        const elements = stripe.elements({
          clientSecret,
          appearance: { theme: "stripe" },
        });
        elementsRef.current = elements;
        const paymentEl = elements.create("payment");
        paymentEl.mount(mountRef.current);
        paymentEl.on("ready", () => setReady(true));
      })
      .catch(() => {
        setError("Failed to load payment form. Please refresh and try again.");
      });
    // No cleanup — Stripe manages its own iframe lifecycle
  }, [clientSecret]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripeRef.current || !elementsRef.current) return;
    setLoading(true);
    setError("");
    const { error: stripeError } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: {
        return_url: `${window.location.origin}/donate/success`,
      },
    });
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
    // On success Stripe handles the redirect automatically
  }

  const displayAmount =
    amount >= 100000 ? `$${amount / 100000}k` : `$${amount / 100}`;
  const displayFreq =
    frequency === "monthly" ? "/month" : frequency === "yearly" ? "/year" : "";

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate/60 font-sans">Completing your gift</p>
          <p className="text-2xl font-bold font-sans text-navy">
            {displayAmount}
            <span className="text-sm font-normal text-slate/60 ml-1">{displayFreq}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate/50 hover:text-navy transition-colors font-sans underline"
        >
          ← Change amount
        </button>
      </div>

      {/* Stripe Payment Element mounts here — div must always be visible and empty */}
      <div className="relative min-h-[200px]">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate/40 text-sm font-sans animate-pulse">Loading payment form…</div>
          </div>
        )}
        <div ref={mountRef} />
      </div>

      {error && <p className="text-red-600 text-sm font-sans">{error}</p>}

      <button
        type="submit"
        disabled={loading || !ready}
        className="btn-copper w-full text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Processing…" : `Complete ${displayAmount}${displayFreq} Gift`}
      </button>

      <p className="text-center text-xs text-slate/40 font-sans">
        Secured by Stripe · SSL encrypted
      </p>
    </form>
  );
}

// ─── Step 1: Donation Form ──────────────────────────────────────────────────────
export function DonateForm() {
  const [amount, setAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const resolvedAmount =
    amount === "custom" ? parseFloat(customAmount) * 100 : amount * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cents = resolvedAmount;
    if (!cents || cents < 100) {
      setError("Please enter a donation amount of at least $1.");
      return;
    }
    if (!email) {
      setError("Email is required to send your receipt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cents, frequency, name, email, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start payment.");
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (clientSecret) {
    return (
      <PaymentStep
        clientSecret={clientSecret}
        amount={resolvedAmount}
        frequency={frequency}
        onBack={() => setClientSecret(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {/* Frequency toggle */}
      <div>
        <p className="form-label">Donation Frequency</p>
        <div className="flex rounded-lg border border-mist overflow-hidden">
          {(["one-time", "monthly", "yearly"] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 py-2.5 text-sm font-semibold font-sans transition-colors capitalize ${
                frequency === f
                  ? "bg-navy text-white"
                  : "bg-white text-slate/70 hover:bg-mist"
              }`}
            >
              {f === "one-time" ? "One-Time" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preset amounts */}
      <div>
        <p className="form-label">Donation Amount</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`py-2.5 rounded-md text-sm font-semibold font-sans border transition-colors ${
                amount === a
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-slate border-mist hover:border-[#0A77BC]/40"
              }`}
            >
              ${`${a >= 1000 ? `${a / 1000}k` : a}`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount("custom")}
            className={`py-2.5 rounded-md text-sm font-semibold font-sans border transition-colors ${
              amount === "custom"
                ? "bg-navy text-white border-navy"
                : "bg-white text-slate border-mist hover:border-[#0A77BC]/40"
            }`}
          >
            Custom
          </button>
        </div>

        {amount === "custom" && (
          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50 text-sm font-sans">
              $
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="form-input pl-7"
              placeholder="Enter amount"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Name + email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="donor-name" className="form-label">
            Your Name
          </label>
          <input
            id="donor-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Full name"
          />
        </div>
        <div>
          <label htmlFor="donor-email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="donor-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="For your receipt"
          />
        </div>
      </div>

      {/* Optional comment */}
      <div>
        <label htmlFor="donor-comment" className="form-label">
          Comment{" "}
          <span className="text-slate/40 font-normal">(optional, max 100 chars)</span>
        </label>
        <input
          id="donor-comment"
          type="text"
          maxLength={100}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="form-input"
          placeholder="A note with your gift…"
        />
        <p className="text-xs text-slate/40 mt-1 text-right font-sans">
          {comment.length}/100
        </p>
      </div>

      {error && <p className="form-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-copper w-full text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Preparing checkout…"
          : `Give ${frequency !== "one-time" ? frequency : ""} ${
              amount !== "custom"
                ? `$${amount >= 1000 ? `${amount / 1000}k` : amount}`
                : customAmount
                ? `$${parseFloat(customAmount).toLocaleString()}`
                : ""
            }`.trim()}
      </button>
    </form>
  );
}
