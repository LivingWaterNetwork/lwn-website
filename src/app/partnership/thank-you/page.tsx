"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COPY: Record<string, { kicker: string; title: string; body: string }> = {
  inquiry: {
    kicker: "Thank You",
    title: "We're Honored You Reached Out",
    body:
      "Your partnership inquiry means a lot to us — this isn't a form letter, and it isn't a form response either. Omar or a member of our team will personally follow up within 24-48 hours to continue the conversation.",
  },
  pledge: {
    kicker: "Thank You",
    title: "This Is a Big Deal — We Don't Take It Lightly",
    body:
      "A multi-year pledge is one of the most meaningful things a partner can offer us: the confidence to plan years ahead. We've received your information and Omar will personally reach out soon to talk through what this commitment could look like.",
  },
  gala: {
    kicker: "Thank You",
    title: "See You in the Room",
    body:
      "Thank you for stepping toward the Gala with us. Our team has your sponsorship interest and will follow up shortly to confirm details, seating, and next steps as the date and venue are finalized.",
  },
  default: {
    kicker: "Thank You",
    title: "We've Received Your Message",
    body: "Thank you for reaching out to Living Water Network — our team will be in touch soon.",
  },
};

function ThankYouContent() {
  const params = useSearchParams();
  const type = params.get("type") ?? "default";
  const copy = COPY[type] ?? COPY.default;

  return (
    <section className="bg-navy py-28 text-white text-center min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4">
        <p className="section-label text-spring mb-4">{copy.kicker}</p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">{copy.title}</h1>
        <p className="text-white/70 font-sans text-lg leading-relaxed mb-10">{copy.body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/partnership" className="btn-copper">
            Back to Partnership
          </Link>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/40 hover:border-white text-white font-semibold font-sans text-sm rounded-md transition-colors hover:bg-white/10">
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function PartnershipThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}
