"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { RevealText } from "@/components/motion/RevealText";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";

export function EventsContent() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: "Event Interest: Requesting early access notification for the LWN Black Tie Gala — Winter 2026.",
          subject: "Black Tie Gala Interest",
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-[#060F1A] overflow-hidden">
        {/* Elegant black-tie ambiance — abstract, not a literal photo (no casual event photo fit the tone) */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(192,90,18,0.16), transparent 45%),
                radial-gradient(circle at 80% 15%, rgba(124,203,230,0.12), transparent 40%),
                radial-gradient(circle at 50% 85%, rgba(192,90,18,0.10), transparent 50%),
                linear-gradient(180deg, #060F1A 0%, #0A1B2E 45%, #060F1A 100%)
              `,
            }}
          />
          {/* Soft bokeh dots, evoking string lights at an evening gala */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle, rgba(255,214,165,0.9) 1.5px, transparent 1.5px)
              `,
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 70%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060F1A]/40 via-transparent to-[#060F1A]/95" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
          {/* Coming soon badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-copper/20 border border-copper/40 rounded-full px-4 py-1.5 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-copper animate-pulse" />
            <span className="text-copper font-sans font-semibold text-xs uppercase tracking-[0.2em]">
              Coming Winter 2026
            </span>
          </motion.div>

          <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.1] mb-6">
            <RevealText text="The Living Water" delay={0.15} /><br />
            <span className="italic text-spring">
              <RevealText text="Network Gala" delay={0.35} />
            </span>
          </h1>

          <motion.p
            className="text-white/60 font-sans text-xs uppercase tracking-[0.3em] mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Black Tie · By Invitation
          </motion.p>

          <motion.p
            className="text-white/70 font-sans text-lg leading-relaxed max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
          >
            A landmark evening to publicly launch the Living Water Network movement —
            celebrating what God has built, welcoming new partners into the circle,
            and releasing the next generation of Kingdom leaders.
          </motion.p>

          <motion.a
            href="#notify"
            className="inline-flex items-center gap-2 bg-copper hover:bg-copper-light text-white font-semibold font-sans text-sm px-8 py-4 rounded-md transition-colors tracking-wide"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Request Early Access
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.a>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── What to Expect ── */}
      <section className="py-20 bg-[#060F1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="The Evening"
            heading="A Night Worth Dressing For"
            subheading="This is more than a fundraising gala. It is the public declaration of a movement that has been quietly forming — and an invitation to join it."
            labelClassName="text-copper font-sans font-extrabold text-xs uppercase tracking-[0.2em] mb-4"
            headingClassName="font-serif text-4xl font-semibold text-white leading-tight"
            subheadingClassName="mt-4 text-white/50 font-sans text-sm max-w-xl mx-auto leading-relaxed"
            className="mb-14"
          />

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🥂",
                title: "Celebration & Vision",
                desc: "An evening of reflection on what God has done and vision-casting for the next season of Kingdom impact.",
              },
              {
                icon: "🤝",
                title: "Partnership Circle",
                desc: "Meet the leaders, donors, and allies who are funding and shaping this movement — and formally join them.",
              },
              {
                icon: "🚀",
                title: "The Launch",
                desc: "The official public launch of Living Water Network — including a preview of what's coming in 2027 and beyond.",
              },
            ].map(({ icon, title, desc }) => (
              <StaggerItem
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-serif text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/50 font-sans text-sm leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Divider quote ── */}
      <section className="py-16 bg-navy text-white text-center">
        <FadeInSection className="max-w-2xl mx-auto px-4">
          <blockquote className="font-serif text-2xl md:text-3xl italic text-white leading-relaxed">
            &ldquo;Rivers of living water will flow from within them.&rdquo;
          </blockquote>
          <p className="mt-4 text-spring text-sm font-semibold font-sans tracking-widest uppercase">
            John 7:38
          </p>
        </FadeInSection>
      </section>

      {/* ── Interest form ── */}
      <section id="notify" className="py-20 bg-[#060F1A] text-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <SectionHeading
            label="Reserve Your Spot"
            heading="Request Early Access"
            subheading="Seating is limited and by invitation. Leave your information and our team will be in touch with event details as they are confirmed."
            labelClassName="text-copper font-sans font-extrabold text-xs uppercase tracking-[0.2em] mb-4"
            headingClassName="font-serif text-4xl font-semibold text-white mb-3"
            subheadingClassName="text-white/50 font-sans text-sm leading-relaxed"
            className="mb-10"
          />

          {status === "success" ? (
            <FadeInSection className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-3xl mb-4">✉️</p>
              <h3 className="font-serif text-2xl text-white font-semibold mb-2">You&apos;re on the list.</h3>
              <p className="text-white/50 font-sans text-sm">
                We&apos;ll reach out as event details are confirmed. Thank you for your interest.
              </p>
            </FadeInSection>
          ) : (
            <FadeInSection>
              <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div>
                  <label className="block text-xs font-semibold font-sans text-white/60 uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/30 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold font-sans text-white/60 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/30 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper/50 transition"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-sm font-sans text-center">
                    Something went wrong. Please email{" "}
                    <a href="mailto:info@lwnetwork.org" className="underline">
                      info@lwnetwork.org
                    </a>{" "}
                    directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-copper hover:bg-copper-light disabled:opacity-60 text-white font-semibold font-sans text-sm py-3.5 rounded-md transition-colors tracking-wide mt-2"
                >
                  {status === "loading" ? "Submitting…" : "Request Early Access"}
                </button>
              </form>
            </FadeInSection>
          )}

          <p className="text-white/30 text-xs font-sans text-center mt-6">
            Event details subject to change. We&apos;ll keep you updated.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-navy text-white text-center">
        <FadeInSection className="max-w-xl mx-auto px-4">
          <p className="font-serif italic text-spring text-xl mb-2">Rooted in truth. Sent to lead.</p>
          <p className="text-white/50 font-sans text-sm mb-8">
            Want to support the mission before the Gala?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/donate" className="btn-copper">
              Give Now
            </Link>
            <Link
              href="/cohort"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white/30 text-white font-semibold font-sans text-sm transition-colors hover:border-white hover:bg-white/10"
            >
              Apply for Groundwork
            </Link>
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
