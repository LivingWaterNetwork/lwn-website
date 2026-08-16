import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/donate/success" },
  title: "Thank You — Donation Received",
  description: "Your donation to Living Water Network has been received.",
};

export default function DonateSuccessPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-mist">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="text-6xl mb-6">🌊</div>
        <h1 className="font-serif text-4xl font-semibold text-navy mb-4">Thank You!</h1>
        <p className="text-slate leading-relaxed mb-6 font-sans">
          Your generous gift has been received. You&apos;ll receive a tax receipt at
          the email address you provided. Your support helps us equip Kingdom
          leaders to disrupt darkness and disciple nations.
        </p>
        <p className="text-xs text-slate/55 mb-8 font-sans">
          Living Water Network Inc. is a 501(c)(3) nonprofit organization. All
          donations are tax-deductible to the extent allowed by law.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
          <Link href="/cohort" className="btn-secondary">
            Join the Network
          </Link>
        </div>
      </div>
    </section>
  );
}
