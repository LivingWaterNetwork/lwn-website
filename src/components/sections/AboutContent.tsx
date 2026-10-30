"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { Lightbox, useLightbox } from "@/components/motion/Lightbox";

const ministryPhotos = [
  { src: "/images/prayer-ministry.jpg", alt: "Leaders praying together" },
  { src: "/images/omar-community-event.jpg", alt: "Omar at a community event" },
  { src: "/images/baptism-red-shirt.jpg", alt: "Baptism ministry" },
  { src: "/images/men-neighborhood-prayer.jpg", alt: "Men's ministry gathering" },
  { src: "/images/omar-with-partner.jpg", alt: "Omar with ministry partner" },
  { src: "/images/leadership-group-backstage.jpg", alt: "Leadership community" },
];

const photoItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function AboutContent() {
  const lightbox = useLightbox();

  return (
    <>
      {/* ── Page header ── */}
      <section className="relative bg-navy py-20 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/leadership-group-backstage.jpg"
            alt="Leadership community gathered together"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-3">Our Ministry</p>
          </FadeInSection>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            <RevealText text="About Living Water Network" delay={0.1} />
          </h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <FadeInSection className="rounded-2xl overflow-hidden aspect-[4/3] relative shadow-lg">
            <Image src="/images/prayer-ministry.jpg" alt="Leaders praying together" fill className="object-cover" />
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <SectionHeading align="left" className="mb-6" label="Who We Are" heading="Rooted in Christ. Formed in Community. Sent to Serve." />
            <div className="space-y-4 text-slate leading-relaxed font-sans">
              <p>Living Water Network is an Atlanta-based Christian nonprofit ministry that exists to educate, equip, and empower leaders through spiritual formation, intentional discipleship, and leadership development.</p>
              <p>We serve people leading in churches, communities, and the marketplace. Our conviction is simple: healthy leadership grows from a life rooted in Jesus, shaped by Scripture, and supported by meaningful relationships.</p>
              <p>Through formation cohorts, coaching, mentorship, ministry care, church advisory, and missions, we help leaders put faith into practice in the places God has called them to serve.</p>
              <p>Founded in 2023, LWN brings that work together around a shared mission: helping leaders grow in Christ and equip others to do the same.</p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Dallas Willard quote ── */}
      <section className="py-20 bg-mist">
        <FadeInSection className="max-w-3xl mx-auto px-4 text-center">
          <p className="section-label mb-6">Our Philosophy</p>
          <blockquote className="font-serif text-2xl md:text-3xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left">
            &ldquo;Discipleship is the process of becoming who Jesus would be if he were you.&rdquo;
          </blockquote>
          <p className="mt-4 text-slate text-sm font-semibold font-sans">
            — Dallas Willard
          </p>
        </FadeInSection>
      </section>

      {/* ── Why we exist ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading align="left" className="mb-6" label="Why We Exist" heading="Formation That Strengthens the Church" />
          <FadeInSection delay={0.1} className="space-y-4 text-slate leading-relaxed font-sans">
            <p>
              At Living Water Network, our mission is to impact 100,000 Kingdom leaders
              over the next five years by providing transformative spiritual formation,
              intentional discipleship, and leadership development for those serving in
              both ministry and the marketplace.
            </p>
            <p>
              We serve a diverse range of leaders — from emerging pastors to high-level
              church volunteers, lay leaders, and marketplace influencers — anyone called
              to lead with purpose and integrity.
            </p>
          </FadeInSection>

          <StaggerChildren className="mt-10 grid sm:grid-cols-2 gap-4">
            <StaggerItem className="rounded-xl bg-navy px-6 py-5">
              <p className="font-serif text-2xl font-semibold text-spring mb-1">
                <CountUp value="39%" />
              </p>
              <p className="text-white/70 text-xs font-sans leading-relaxed">
                of Christians aren&apos;t engaged in discipleship in either direction —
                the exact gap our formation model exists to close.
              </p>
              <p className="text-white/40 text-[10px] font-sans uppercase tracking-wide mt-2">
                Barna Group, 2025
              </p>
            </StaggerItem>
            <StaggerItem className="rounded-xl bg-navy px-6 py-5">
              <p className="font-serif text-2xl font-semibold text-spring mb-1">
                <CountUp value="35%" />
              </p>
              <p className="text-white/70 text-xs font-sans leading-relaxed">
                of U.S. pastors qualify as fully healthy across every measure Barna tracks —
                why formation has to include the leader&apos;s own well-being, not just output.
              </p>
              <p className="text-white/40 text-[10px] font-sans uppercase tracking-wide mt-2">
                Barna Group, Pastoral Well-Being
              </p>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* ── Ministry in action photo grid ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="Ministry in Action" heading="Equipping Leaders Everywhere" />
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ministryPhotos.map(({ src, alt }, index) => (
              <motion.div key={src} variants={photoItemVariants} className="relative rounded-xl overflow-hidden aspect-video">
                <button
                  type="button"
                  onClick={() => lightbox.open(index)}
                  className="group relative block h-full w-full cursor-zoom-in"
                  aria-label={`Expand photo: ${alt}`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>
      <Lightbox images={ministryPhotos} activeIndex={lightbox.activeIndex} onClose={lightbox.close} />

      {/* ── 501(c)(3) statement ── */}
      <section className="py-10 bg-mist">
        <FadeInSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-[#0A77BC]/5 border border-[#0A77BC]/20 px-6 py-5 flex gap-4 items-start">
            <div className="text-[#0A77BC] mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-slate leading-relaxed font-sans">
              <strong className="text-navy">Living Water Network Inc.</strong> is a
              registered 501(c)(3) nonprofit organization. All donations are
              tax-deductible to the extent allowed by law.
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-navy text-white text-center">
        <FadeInSection className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold mb-2">Ready to lead?</h2>
          <p className="font-serif italic text-spring text-xl mb-4">Rooted in truth. Sent to lead.</p>
          <p className="text-white/65 mb-8 font-sans">
            Ready to be equipped, restored, and sent out to lead with Kingdom purpose?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cohort" className="btn-copper">Join the Network</Link>
            <Link href="/donate" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white/40 text-white font-semibold font-sans text-sm transition-colors hover:border-white hover:bg-white/10">
              Support the Mission
            </Link>
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
