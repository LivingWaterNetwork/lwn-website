"use client";

import Link from "next/link";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

interface FAQContentProps {
  faqs: FAQCategory[];
}

export function FAQContent({ faqs }: FAQContentProps) {
  return (
    <>
      {/* Hero */}
      <FadeInSection>
        <section className="bg-navy py-20 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <p className="section-label text-spring mb-3">Frequently Asked Questions</p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Questions About Groundwork
            </h1>
            <p className="text-white/65 font-sans text-base leading-relaxed">
              Everything you need to know about LWN&apos;s 9-month formation journey.
            </p>
          </div>
        </section>
      </FadeInSection>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {faqs.map(({ category, items }) => (
            <FadeInSection key={category}>
              <h2 className="font-serif text-2xl text-navy font-semibold mb-6 pb-3 border-b border-mist">
                {category}
              </h2>
              <StaggerChildren className="space-y-6">
                {items.map(({ q, a }) => (
                  <StaggerItem key={q} className="group">
                    <h3 className="font-sans font-semibold text-navy text-base mb-2">{q}</h3>
                    <p className="text-slate font-sans text-sm leading-relaxed">{a}</p>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <FadeInSection>
        <section className="py-16 bg-mist text-center">
          <div className="max-w-xl mx-auto px-4">
            <p className="section-label mb-3">Still have questions?</p>
            <h2 className="section-heading mb-4">We&apos;d love to talk.</h2>
            <p className="text-slate font-sans text-sm leading-relaxed mb-6">
              Reach out directly or apply and our team will be in touch.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/cohort#apply" className="btn-primary">
                Apply for Groundwork
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
