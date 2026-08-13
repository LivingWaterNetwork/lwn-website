"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { CohortForm } from "@/components/sections/CohortForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { Lightbox, useLightbox } from "@/components/motion/Lightbox";

const pillars = [
  { num: "01", name: "Presence", desc: "Spiritual health — prayer, Sabbath, Scripture, and obedience" },
  { num: "02", name: "Mind", desc: "Mental health — renewing the thought life under Christ" },
  { num: "03", name: "Heart", desc: "Emotional health — inner healing and the hidden places" },
  { num: "04", name: "Body", desc: "Physical health — honoring the vessel God gave you" },
  { num: "05", name: "Community", desc: "Relational health — being known and truly knowing others" },
  { num: "06", name: "Stewardship", desc: "Calling, gifts, time, money, and the legacy you carry" },
];

const tracks = [
  {
    id: "shepherd",
    name: "Shepherd Track",
    audience: "Ministry & Mission",
    emoji: "🌿",
    headerBg: "bg-navy",
    labelColor: "text-spring",
    accentColor: "text-navy",
    borderColor: "border-navy",
    phase2: "Discovering your pastoral gifts, prophetic calling, and ministry lane. Healing the places where religious performance has replaced genuine communion with God.",
    phase3: "Local serving in church and ministry settings. International missions trip serving as Jesus served — proclaiming the gospel, making disciples, and strengthening the local church.",
    forWho: "For those called to full-time ministry, church planting, pastoral leadership, or international missions work.",
  },
  {
    id: "builder",
    name: "Builder Track",
    audience: "Marketplace & Entrepreneurship",
    emoji: "⚙️",
    headerBg: "bg-copper",
    labelColor: "text-white/80",
    accentColor: "text-copper",
    borderColor: "border-copper",
    phase2: "Discovering your gifts in leadership and business. Aligning your professional calling with Kingdom purpose and learning to operate as a Kingdom agent in the marketplace.",
    phase3: "Internships and serving with Kingdom-minded businesses in the LWN partner network. International missions trip serving as Jesus served — bringing Kingdom resources and presence where they are most needed.",
    forWho: "For those called to climb the corporate ladder, launch companies, or operate as Kingdom agents in the marketplace.",
  },
  {
    id: "canvas",
    name: "Canvas Track",
    audience: "Creatives & Influencers",
    emoji: "🎨",
    headerBg: "bg-deep-sea",
    labelColor: "text-spring",
    accentColor: "text-deep-sea",
    borderColor: "border-deep-sea",
    phase2: "Discovering how your creative gift serves the Kingdom. Healing the wounds that have silenced or distorted your voice. Surrendering your art to God's authorship.",
    phase3: "Local serving through creative outreach, worship, and arts ministry. International missions trip serving as Jesus served — using story, music, and creative expression to carry the gospel.",
    forWho: "For artists, musicians, content creators, influencers, and storytellers who carry the Kingdom through their creative gift.",
  },
];

const phases = [
  {
    id: "phase1",
    headerBg: "bg-navy",
    labelColor: "text-spring",
    dotColor: "bg-copper",
    eyebrow: "Phase 01 · Months 1–3",
    title: "At the Table",
    subtitle: "Foundation",
    body: (
      <>
        All three tracks begin at the same Table. Twelve weeks through{" "}
        <em>At the Table</em> — LWN&apos;s proprietary formation guide authored by Omar J.
        Fandino — covering six pillars of whole-person health.
      </>
    ),
    list: ["Presence", "Mind", "Heart", "Body", "Community", "Stewardship"],
    note: "All tracks run simultaneously in separate groups — same content, track-specific community.",
  },
  {
    id: "phase2",
    headerBg: "bg-deep-sea",
    labelColor: "text-spring",
    dotColor: "bg-deep-sea",
    eyebrow: "Phase 02 · Months 4–6",
    title: "Discover & Refine",
    subtitle: "Calling & Healing",
    body: (
      <>
        The work goes deeper. Groups are led by seasoned, formed leaders from local churches
        and organizations — with the support of pastors and licensed therapists — to uncover
        calling, identify gifts, and open the hidden places to healing.
      </>
    ),
    list: [
      "Calling discovery sessions",
      "Spiritual gift identification",
      "Inner healing sessions",
      "Pastoral & therapeutic support",
      "Track-specific vocation focus",
      "Community accountability",
    ],
    note: "Each group is led by a seasoned leader within that vocation — supported by pastoral and therapeutic care.",
  },
  {
    id: "phase3",
    headerBg: "bg-copper",
    labelColor: "text-white/75",
    dotColor: "bg-copper",
    eyebrow: "Phase 03 · Months 7–9",
    title: "Activate",
    subtitle: "Mission & Deployment",
    body: (
      <>
        Formation meets the field. Phase 3 moves you from preparation into Kingdom action —
        local serving, missions fundraising, and an international missions trip where you
        go where Jesus goes and give what He has given you.
      </>
    ),
    list: [
      "Track-specific local serving",
      "Internships with LWN partners",
      "Missions fundraising training",
      "International missions trip",
      "Hands-on deployment",
      "Post-cohort mentorship access",
    ],
    note: "All tracks go on the same international trip, serving together as the body of Christ.",
  },
];

const topPhotos = [
  { src: "/images/outdoor-night-gathering.jpg", alt: "Formation gathering" },
  { src: "/images/cohort-group-activity.jpg", alt: "Formation in community" },
  { src: "/images/missions-trip-group.jpg", alt: "International missions" },
  { src: "/images/missions-kids-group.jpg", alt: "Serving on the field" },
];

const communityPhotos = [
  { src: "/images/team-elevator-selfie.jpg", alt: "Team fellowship and joy" },
  { src: "/images/baptism-pool.jpg", alt: "Baptism and spiritual transformation" },
  { src: "/images/mission-trip-bus.jpg", alt: "Traveling together in missions" },
  { src: "/images/omar-missions-llama.jpg", alt: "Serving on international missions" },
  { src: "/images/omar-with-colleague.jpg", alt: "Mentoring and discipleship" },
  { src: "/images/baptism-closeup2.jpg", alt: "Serving in ministry together" },
];

const programDetails = [
  {
    icon: "📅",
    label: "Cohort Dates",
    value: "Spring 2027 · Applications now open — reserve your spot today.",
  },
  {
    icon: "📍",
    label: "Format",
    value: "Virtual · accessible from anywhere in the world.",
  },
  {
    icon: "👥",
    label: "Cohort Size",
    value: "8–12 people per track group. Intentionally small. Deeply relational.",
  },
  {
    icon: "💛",
    label: "Investment",
    value: "Scholarship model. Program costs covered by LWN partners. Application fee required.",
  },
];

const photoItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function CohortContent() {
  const topLightbox = useLightbox();
  const communityLightbox = useLightbox();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/youth-prayer-poolside.jpg"
            alt="Groundwork cohort community in prayer"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">Join the Network</p>
          </FadeInSection>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
            <RevealText text="Groundwork" delay={0.1} />
          </h1>
          <FadeInSection delay={0.5}>
            <p className="text-white/50 font-sans text-sm tracking-widest uppercase mb-5">
              A Living Water Network Formation Journey
            </p>
            <p className="text-white/70 text-lg font-sans max-w-2xl mx-auto leading-relaxed">
              A 9-month immersive journey that forms Kingdom leaders from the inside out —
              before you are sent, you will be formed.
            </p>
          </FadeInSection>
          <StaggerChildren className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-sans">
            {["🌿 Shepherd Track", "⚙️ Builder Track", "🎨 Canvas Track"].map((t) => (
              <StaggerItem
                key={t}
                className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80"
              >
                {t}
              </StaggerItem>
            ))}
          </StaggerChildren>
          <FadeInSection delay={0.7} className="mt-8">
            <Link href="#apply" className="btn-primary">
              Apply for Spring 2027
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ── Photo Strip ── */}
      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 h-48 md:h-56">
        {topPhotos.map(({ src, alt }, index) => (
          <motion.div key={src} variants={photoItemVariants} className="relative overflow-hidden">
            <button
              type="button"
              onClick={() => topLightbox.open(index)}
              className="group relative block h-full w-full cursor-zoom-in"
              aria-label={`Expand photo: ${alt}`}
            >
              <Image src={src} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-navy/30" />
            </button>
          </motion.div>
        ))}
      </StaggerChildren>
      <Lightbox images={topPhotos} activeIndex={topLightbox.activeIndex} onClose={topLightbox.close} />

      {/* ── Why Groundwork Exists ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-8" label="Why Groundwork Exists" heading="The Church Has a Formation Crisis" />
          <FadeInSection delay={0.1} className="space-y-4 text-slate font-sans text-base leading-relaxed">
            <p>
              We are living in the most resourced moment in the history of the Church. Sermons are searchable.
              Conferences fill arenas. Podcasts run twenty-four hours a day. By every measurable input,
              this generation should be the most spiritually mature in history.
            </p>
            <p className="text-center font-serif text-xl text-navy py-4 border-l-4 border-copper pl-6 text-left">
              &ldquo;The crisis is not a content crisis. It is a formation crisis. We are training leaders
              we have not yet formed — and sending leaders who have not yet been brought to the Healer.&rdquo;
            </p>
            <p>
              Groundwork exists to interrupt that pattern. Before the water flows through you, the ground
              must be prepared. Before you lead others, you sit at the Table. Before you are sent, you are formed.
            </p>
            <p className="text-sm bg-mist rounded-lg px-5 py-4">
              Barna Group&apos;s research backs up what we&apos;re describing:{" "}
              <strong className="text-navy">39% of Christians aren&apos;t currently engaged in
              discipleship in either direction</strong> — not being discipled, and not discipling
              anyone else. Groundwork exists specifically to close that gap, on purpose, in
              community, over nine months instead of leaving it to chance.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ── 3-Phase Journey ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="The Journey"
            heading="Three Phases. Nine Months."
            subheading="Each phase builds on the one before it. You cannot skip the Table to get to the Field."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-xl"
          />

          {/* Timeline connector on desktop — sequential stepped reveal */}
          <StaggerChildren className="grid md:grid-cols-3 gap-6 relative">
            {phases.map((phase) => (
              <StaggerItem key={phase.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className={`${phase.headerBg} px-6 py-5`}>
                  <p className={`${phase.labelColor} text-xs font-semibold tracking-widest uppercase font-sans mb-1`}>
                    {phase.eyebrow}
                  </p>
                  <h3 className="font-serif text-2xl text-white font-semibold">{phase.title}</h3>
                  <p className="text-white/55 text-sm font-sans mt-1">{phase.subtitle}</p>
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col">
                  <p className="text-slate text-sm font-sans leading-relaxed mb-4">{phase.body}</p>
                  <ul className="space-y-1.5 mb-4">
                    {phase.list.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs font-sans text-slate">
                        <span className={`w-1.5 h-1.5 rounded-full ${phase.dotColor} shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto bg-mist rounded-lg px-3 py-2 text-xs font-sans text-slate/70 italic">
                    {phase.note}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Community Photos ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-10"
            label="The Community"
            heading="Formation Happens Together"
            subheading="You will not walk this alone. Groundwork is designed around the conviction that formation happens in community — at the table, in the neighborhood, and on the field."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-xl"
          />
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {communityPhotos.map(({ src, alt }, index) => (
              <motion.div key={src} variants={photoItemVariants} className="relative aspect-square rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => communityLightbox.open(index)}
                  className="group relative block h-full w-full cursor-zoom-in"
                  aria-label={`Expand photo: ${alt}`}
                >
                  <Image src={src} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </button>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>
      <Lightbox images={communityPhotos} activeIndex={communityLightbox.activeIndex} onClose={communityLightbox.close} />

      {/* ── At the Table Deep Dive ── */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">
          <FadeInSection>
            <p className="section-label text-spring mb-3">Phase 01 · The Curriculum</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-snug mb-5">
              At the Table —<br />LWN&apos;s Formation Guide
            </h2>
            <div className="space-y-4 text-white/70 font-sans text-sm leading-relaxed">
              <p>
                <em>At the Table</em> is a 12-week proprietary formation guide authored by Omar J. Fandino.
                It is not a curriculum to finish. It is an invitation to sit — long enough and slowly
                enough — to be remade.
              </p>
              <p>
                The guide is built on a simple conviction: a Table is not a pulpit. A pulpit is a place
                to perform. A Table is a place to be known. Jesus did His most intimate forming at a
                meal — and that is where your formation begins.
              </p>
              <p>
                Every two weeks, one pillar. Reflection questions that expose what is actually true.
                Practices that train the soul — not more information, but embodied obedience.
                Formation happens at the level of repeated practice, not insight.
              </p>
            </div>
            <blockquote className="mt-6 border-l-2 border-copper pl-5 text-white/55 italic text-sm font-sans">
              &ldquo;You do not think your way into a new life. You practice your way into one.&rdquo;
              <cite className="block mt-1 text-xs not-italic text-white/35">
                — Omar J. Fandino, At the Table
              </cite>
            </blockquote>
          </FadeInSection>

          {/* 6 Pillars grid */}
          <StaggerChildren className="grid grid-cols-2 gap-3">
            {pillars.map(({ num, name, desc }) => (
              <StaggerItem
                key={num}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors"
              >
                <p className="text-copper text-xs font-semibold font-sans mb-1">Pillar {num}</p>
                <p className="text-white font-serif text-sm font-semibold mb-1">{name}</p>
                <p className="text-white/50 text-xs font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 3 Tracks ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="Choose Your Track"
            heading="One Foundation. Three Lanes."
            subheading="Every Groundwork participant walks through Phase 1 together. Phases 2 and 3 are shaped by the specific lane God has called you to."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-2xl"
          />

          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <StaggerItem
                key={track.id}
                className={`rounded-2xl border-2 ${track.borderColor} overflow-hidden flex flex-col`}
              >
                {/* Track header */}
                <div className={`${track.headerBg} px-6 py-6 text-white text-center`}>
                  <div className="text-4xl mb-2">{track.emoji}</div>
                  <h3 className="font-serif text-xl font-semibold">{track.name}</h3>
                  <p className={`${track.labelColor} text-xs tracking-widest uppercase font-sans mt-1`}>
                    {track.audience}
                  </p>
                </div>

                {/* Track body */}
                <div className="px-6 py-5 flex-1 flex flex-col gap-4">
                  <p className="text-slate text-sm font-sans leading-relaxed">{track.forWho}</p>

                  <div>
                    <p className={`text-xs font-bold ${track.accentColor} uppercase tracking-wide font-sans mb-1`}>
                      Phase 2 — Discover &amp; Refine
                    </p>
                    <p className="text-xs text-slate font-sans leading-relaxed">{track.phase2}</p>
                  </div>

                  <div>
                    <p className={`text-xs font-bold ${track.accentColor} uppercase tracking-wide font-sans mb-1`}>
                      Phase 3 — Activation
                    </p>
                    <p className="text-xs text-slate font-sans leading-relaxed">{track.phase3}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* Phase 1 unity note */}
          <FadeInSection delay={0.15} className="mt-8 bg-mist rounded-2xl px-6 py-5 text-center">
            <p className="text-sm font-sans text-slate">
              <span className="font-semibold text-navy">Phase 1 is shared across all tracks.</span>{" "}
              Shepherd, Builder, and Canvas participants all walk through{" "}
              <em>At the Table</em> simultaneously — same 12-week formation curriculum,
              within their own track community.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ── Program Details ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="Program Details" heading="What You Need to Know" />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {programDetails.map(({ icon, label, value }) => (
              <StaggerItem key={label} className="card text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <p className="section-label mb-1">{label}</p>
                <p className="text-sm text-slate font-sans leading-relaxed">{value}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Application ── */}
      <section id="apply" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-10"
            label="Applications Open"
            heading="Apply for Groundwork"
            subheading="Fill out the form below and we'll be in touch within a few business days. An application fee is required to reserve your spot."
            headingClassName="section-heading mb-2"
            subheadingClassName="text-slate text-sm font-sans"
          />
          <FadeInSection delay={0.1}>
            <CohortForm />
          </FadeInSection>
          <p className="text-center mt-6 text-sm font-sans text-slate/60">
            Have questions first?{" "}
            <Link href="/faq" className="text-copper hover:underline">
              Read our FAQ
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
