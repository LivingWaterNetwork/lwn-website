"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 5000, 10000];
type Frequency = "one-time" | "monthly" | "yearly";

export function DonateForm() {
  const [amount, setAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout.");

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load.");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
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
              ${a >= 1000 ? `${a / 1000}k` : a}
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
          <span className="text-slate/40 font-normal">
            (optional, max 100 chars)
          </span>
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
          ? "Redirecting to checkout…"
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
