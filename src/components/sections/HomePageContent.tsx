"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ProgramCard } from "@/components/sections/ProgramCard";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { RevealText } from "@/components/motion/RevealText";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { TiltCard } from "@/components/motion/TiltCard";
import { Lightbox, useLightbox } from "@/components/motion/Lightbox";

const programs = [
  {
    title: "Immersive Cohorts",
    description:
      "A 9-month formation journey in spiritual formation, discipleship, and leadership — walked out alongside other leaders, not alone.",
    icon: "🌊",
    href: "/cohort",
  },
  {
    title: "Personal Coaching",
    description:
      "One-on-one formation across all six spheres of your life — spiritual, mental, emotional, physical, relational, stewardship — with direct access between sessions.",
    icon: "🎯",
    href: "/programs/coaching",
  },
  {
    title: "Personalized Counseling",
    description:
      "Sessions tailored to the spiritual, emotional, and relational dimensions of leadership — for the parts of the job that don't show up on a resume.",
    icon: "🧭",
    href: "/programs/counseling",
  },
  {
    title: "Strategic Mentorships",
    description:
      "Pairing emerging and seasoned leaders for intentional, Spirit-led mentorship — the Paul-and-Timothy relationship most leaders never had.",
    icon: "🤝",
    href: "/programs/mentorship",
  },
  {
    title: "Church Advisory Services",
    description:
      "Strategy and systems consulting for the church itself — volunteer engagement, young adult ministry, and small group leadership development.",
    icon: "⛪",
    href: "/programs/church-advisory",
  },
  {
    title: "Public Speaking",
    description:
      "Dynamic engagements that equip congregations, conferences, and organizations with Kingdom vision and practical next steps.",
    icon: "🎤",
    href: "/programs/speaking",
  },
  {
    title: "Mission Trips",
    description:
      "International experiences designed to broaden perspective and deepen your Kingdom mandate — formation tested against something real.",
    icon: "✈️",
    href: "/programs/missions",
  },
];

const stats = [
  {
    figure: "39%",
    label:
      "of Christians aren't engaged in discipleship in either direction — not being discipled, and not discipling anyone else.",
    source: "Barna Group, 2025",
  },
  {
    figure: "35%",
    label:
      "of U.S. pastors qualify as fully healthy across every measure of well-being Barna tracks. Leaders can't pour from an empty well.",
    source: "Barna Group, Pastoral Well-Being",
  },
  {
    figure: "~2x",
    label:
      "Gen Z church attendance has nearly doubled since 2020 — a generation walking back in, looking for more than another service to attend.",
    source: "Barna Group, 2025",
  },
];

const impactPhotos = [
  { src: "/images/baptism-pool2.jpg", alt: "Baptism ministry", caption: "Baptisms & new life" },
  { src: "/images/youth-prayer-poolside.jpg", alt: "Community in prayer", caption: "Community in prayer" },
  { src: "/images/men-ministry-group.jpg", alt: "Men's ministry gathering", caption: "Men's formation groups" },
  { src: "/images/outreach-group.jpg", alt: "Community outreach", caption: "Local outreach" },
  { src: "/images/missions-kids-ministry.jpg", alt: "International mission trip", caption: "International missions" },
  { src: "/images/radical-mentoring-group.jpg", alt: "Mentorship and discipleship", caption: "Mentorship in action" },
  { src: "/images/prayer-restaurant.jpg", alt: "Leaders praying together", caption: "Leaders formed together" },
  { src: "/images/outdoor-night-gathering.jpg", alt: "Community gathering", caption: "Community gatherings" },
];

const photoItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function HomePageContent() {
  const lightbox = useLightbox();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-deep-sea opacity-95" />

        <ParallaxLayer className="absolute inset-0 pointer-events-none" speed={0.35}>
          {/* drifting light layer */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full bg-current/10 blur-3xl animate-drift-a" />
            <div className="absolute -bottom-40 -right-16 w-[600px] h-[600px] rounded-full bg-spring/10 blur-3xl animate-drift-b" />
          </div>
          {/* water ripple rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full border border-white/5 absolute animate-ripple" />
            <div className="w-[900px] h-[900px] rounded-full border border-white/5 absolute animate-ripple-delay" />
            <div className="w-[1200px] h-[1200px] rounded-full border border-white/5 absolute animate-ripple" />
          </div>
        </ParallaxLayer>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-36 pb-16 text-center">
          <motion.p
            className="section-label text-spring mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Living Water Network
          </motion.p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-white leading-tight max-w-3xl mx-auto">
            <RevealText
              text="Equipping Kingdom leaders to disrupt darkness and disciple nations."
              delay={0.15}
            />
          </h1>
          <motion.p
            className="mt-6 text-white/70 text-lg max-w-xl mx-auto leading-relaxed font-sans"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Spiritual formation, discipleship, and leadership development for
            those called to lead — in ministry and the marketplace.
          </motion.p>
          <motion.p
            className="mt-4 font-serif italic text-spring text-xl md:text-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
          >
            Rooted in truth. Sent to lead.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Link href="/cohort" className="btn-copper text-base px-8 py-3.5">
              Join the Network
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md border-2 border-white/40 text-white font-semibold font-sans text-base transition-colors hover:border-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div
          className="relative flex justify-center pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/50"
            aria-hidden="true"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Credibility strip */}
        <div className="relative border-t border-white/10 bg-black/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-3">
            <span className="badge">501(c)(3) Nonprofit</span>
            <span className="badge">Founded 2023 · Atlanta, GA</span>
            <span className="badge">7 Formation Programs</span>
            <span className="badge">Proprietary &ldquo;At the Table&rdquo; Curriculum</span>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white">
        <FadeInSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">Our Mission</p>
          <h2 className="section-heading mb-8">Impacting 100,000 Kingdom Leaders</h2>
          <div className="prose prose-lg text-slate font-sans leading-relaxed mx-auto text-left space-y-4">
            <p>
              At Living Water Network, our mission is to impact 100,000 Kingdom leaders
              over the next five years by providing transformative spiritual formation,
              intentional discipleship, and leadership development for those serving in both
              ministry and the marketplace.
            </p>
            <p>
              We serve a diverse range of leaders — from emerging pastors to high-level
              church volunteers, lay leaders, and marketplace influencers — anyone called to
              lead with purpose and integrity.
            </p>
            <p>
              Through immersive cohorts, personal coaching, counseling, and strategic mentorships,
              we empower leaders to return to their communities restored, equipped, and
              inspired to spark meaningful change. Alongside these core programs, we advise
              churches directly, offer dynamic public speaking engagements, and lead
              international mission trips designed to broaden perspectives and deepen global
              Kingdom impact.
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* ── Why now / stats ── */}
      <section className="py-20 bg-navy text-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeading
            className="mb-12"
            label="Why This Work Matters Now"
            heading="The Research Confirms What We See Every Day"
            subheading="We don't build programs around trends — we build them around the actual gap between where leaders are and where formation could take them."
            labelClassName="section-label text-spring"
            headingClassName="font-serif text-3xl md:text-4xl font-semibold"
            subheadingClassName="mt-3 text-white/60 font-sans text-sm max-w-2xl"
          />
          <StaggerChildren className="grid sm:grid-cols-3 gap-8">
            {stats.map(({ figure, label, source }) => (
              <StaggerItem key={label} className="text-center">
                <p className="stat-figure mb-3">
                  <CountUp value={figure} />
                </p>
                <p className="text-white/75 text-sm font-sans leading-relaxed mb-2">{label}</p>
                <p className="text-white/45 text-xs font-sans uppercase tracking-wide">{source}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <p className="text-white/40 text-xs font-sans text-center mt-10 max-w-2xl mx-auto">
            Sources: Barna Group discipleship, pastoral well-being, and generational research.
            Read more on our <Link href="/blog" className="underline hover:text-white/70">blog</Link>.
          </p>
        </div>
      </section>

      {/* ── Programs overview ── */}
      <section className="py-20 bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-12" label="What We Offer" heading="Programs Built to Transform" />
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p) => (
              <StaggerItem key={p.title} className="h-full">
                <TiltCard className="h-full">
                  <ProgramCard {...p} />
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <div className="mt-10 text-center">
            <Link href="/programs" className="btn-secondary">
              Explore All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact photo strip ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="See the Impact" heading="Transformation Happens Here" />
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {impactPhotos.map(({ src, alt, caption }, index) => (
              <motion.div
                key={src}
                variants={photoItemVariants}
                className="relative rounded-xl overflow-hidden aspect-square"
              >
                <button
                  type="button"
                  onClick={() => lightbox.open(index)}
                  className="group relative block h-full w-full cursor-zoom-in"
                  aria-label={`Expand photo: ${caption}`}
                >
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/0 to-navy/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-sans font-semibold leading-tight">{caption}</p>
                  </div>
                </button>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>
      <Lightbox images={impactPhotos} activeIndex={lightbox.activeIndex} onClose={lightbox.close} />

      {/* ── First Cohort Launch ── */}
      <section className="py-20 bg-deep-sea text-white">
        <FadeInSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label text-spring mb-4">First Cohort</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight mb-4">
            Launching Spring 2027
          </h2>
          <p className="text-white/75 text-lg font-sans max-w-2xl mx-auto mb-8 leading-relaxed">
            The Living Water Network inaugural cohort is forming now. An immersive journey in
            spiritual formation, discipleship, and Kingdom leadership — built for leaders who
            are ready to go deep before they go far.
          </p>
          <Link href="/cohort" className="btn-copper">
            Apply Now
          </Link>
        </FadeInSection>
      </section>

      {/* ── CTA banners ── */}
      <FadeInSection>
        <CtaBanner />
      </FadeInSection>
    </>
  );
}
