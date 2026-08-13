"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ContactForm } from "@/components/sections/ContactForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { RevealText } from "@/components/motion/RevealText";

export function ContactContent() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.p
            className="section-label text-spring mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Reach Out
          </motion.p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            <RevealText text="Contact Us" delay={0.15} />
          </h1>
          <motion.p
            className="mt-4 text-white/65 font-sans"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Questions, speaking requests, partnership inquiries — we&apos;re here.
          </motion.p>
        </div>
      </section>

      {/* ── General Contact ── */}
      <section className="py-20 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <FadeInSection>
            <h2 className="section-heading mb-6">Get in Touch</h2>
            <div className="space-y-4 text-slate text-sm leading-relaxed font-sans">
              <p>
                Whether you have questions about our programs, want to invite us to speak,
                or simply want to learn more about Living Water Network — we&apos;d love to
                connect.
              </p>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0A77BC] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@lwnetwork.org" className="text-[#0A77BC] hover:underline font-medium">
                  info@lwnetwork.org
                </a>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <ContactForm />
          </FadeInSection>
        </div>
      </section>

      {/* ── Major Gifts & Institutional Partnerships ── */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">
          <FadeInSection>
            <SectionHeading
              label="Major Gifts & Institutional Partnerships"
              heading="Considering a Significant Investment?"
              align="left"
              labelClassName="section-label text-spring mb-3"
              headingClassName="font-serif text-3xl md:text-4xl font-semibold leading-snug mb-5"
            />
            <div className="space-y-4 text-white/70 font-sans text-sm leading-relaxed">
              <p>
                If you&apos;re exploring a major gift, a multi-year commitment, foundation funding,
                or a partnership between LWN and your church, business, or organization, this is
                a different conversation than a general inquiry — and it deserves direct access
                to our founder.
              </p>
              <p>
                Reach out here and Omar Fandino, LWN&apos;s founder, will personally follow up to
                discuss vision, structure, and how your investment maps to our theory of change.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/theory-of-change" className="btn-secondary">
                See Our Theory of Change
              </Link>
              <Link href="/partnership" className="btn-copper">
                View Partnership Tiers
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-spring shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:ofandino@lwnetwork.org" className="text-spring hover:underline font-medium">
                ofandino@lwnetwork.org
              </a>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <ContactForm
              subject="Major Gift / Institutional Partnership Inquiry"
              messagePlaceholder="Tell us about your organization and what you're considering — a major gift, multi-year commitment, foundation funding, or institutional partnership."
              submitLabel="Send to Our Founder"
              successTitle="Thank You"
              successBody="Omar will personally follow up within 1–2 business days to continue the conversation."
            />
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
