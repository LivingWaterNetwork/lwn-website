"use client";

import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { Lightbox, useLightbox } from "@/components/motion/Lightbox";

const trip = [
  {
    step: "01",
    title: "Local Serving First",
    desc: "Before you cross a border, you serve where you already are — local serving and missions fundraising training, so the trip isn't your first act of obedience.",
  },
  {
    step: "02",
    title: "The Trip Itself",
    desc: "Hands-on Kingdom service alongside our partner church, FHC, in Ecuador — proclaiming the gospel, serving practical needs, and standing alongside a local body of believers already doing the work.",
  },
  {
    step: "03",
    title: "Deployment, Not Just a Memory",
    desc: "You come home with more than photos — a widened Kingdom perspective, a global network of believers, and a sharpened sense of your own mandate in the earth.",
  },
];

const practicals = [
  { icon: "📍", label: "Destination", value: "Ecuador, in sustained partnership with FHC — our first deployment corridor." },
  { icon: "👥", label: "Who Can Go", value: "Open to leaders across all three Groundwork tracks, and to those outside the cohort who feel the pull." },
  { icon: "🗓️", label: "When", value: "Trips are scheduled around the Groundwork cohort calendar — inquire for the next date." },
  { icon: "💛", label: "Cost", value: "Trip costs are shared with participants; missions fundraising training and support are part of preparation." },
];

const missionPhotos = [
  { src: "/images/mission-trip-bus.jpg", alt: "Traveling together on a mission trip" },
  { src: "/images/missions-trip-group.jpg", alt: "Missions trip group" },
  { src: "/images/missions-kids-group.jpg", alt: "Serving children on the field" },
  { src: "/images/omar-missions-llama.jpg", alt: "Omar Fandino serving on international missions" },
];

const fields: ProgramField[] = [
  {
    type: "select",
    id: "priorExperience",
    label: "Have you been on a missions trip before?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No, this would be my first" },
    ],
  },
  {
    type: "textarea",
    id: "draw",
    label: "What draws you to this trip?",
    required: true,
    placeholder: "Tell us what's pulling you toward this — a calling, a curiosity, a nudge you can't shake.",
    rows: 6,
  },
];

export function MissionsContent() {
  const lightbox = useLightbox();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/missions-kids-ministry.jpg"
            alt="LWN team serving children on an international mission trip"
            fill
            className="object-cover object-center opacity-20"
            style={{ objectPosition: "50% 20%" }}
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">Broadened Perspective, Deepened Calling</p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
              <RevealText text="International Mission Trips" delay={0.15} />
            </h1>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
              There is nothing like crossing a border to reshape a leader&apos;s worldview.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.35}>
            <div className="mt-8">
              <Link href="#inquire" className="btn-primary">
                Inquire About Trips
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Problem statement ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            label="The Honest Problem"
            heading="Most Leaders Never Test Their Calling Against Anything Real"
            headingClassName="section-heading mb-6"
          />
          <FadeInSection delay={0.15}>
            <p className="text-slate font-sans text-base leading-relaxed">
              It&apos;s easy to talk about calling from a comfortable chair. Crossing a border,
              serving people whose lives depend on more than a Sunday habit, has a way of
              clarifying — or correcting — what you thought you believed about your own mandate.
            </p>
            <blockquote className="mt-8 font-serif text-xl md:text-2xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left max-w-xl mx-auto">
              &ldquo;Calling sounds spiritual until it costs you a plane ticket and a language you
              don&apos;t speak. That&apos;s usually where I&apos;ve found out if I actually
              believed it.&rdquo;
              <cite className="block mt-3 text-sm not-italic text-slate/60 font-sans">
                — Omar J. Fandino, Founder of Living Water Network{" "}
                <span className="text-copper">· echoes Isaiah 6:8</span>
              </cite>
            </blockquote>
          </FadeInSection>
        </div>
      </section>

      {/* ── Trip structure ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="How the Trip Works"
            heading="Formation Meets the Field"
            subheading="The same Phase 3 of Groundwork — local serving, then deployment — applied whether or not you're currently in the cohort."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-xl mx-auto"
          />
          <StaggerChildren className="space-y-0">
            {trip.map(({ step, title, desc }) => (
              <StaggerItem key={step} className="flex gap-5 py-5 border-b border-white/40 last:border-none">
                <div className="shrink-0 w-11 h-11 rounded-full bg-navy text-spring font-serif font-semibold flex items-center justify-center text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-navy mb-1">{title}</h3>
                  <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Practicals ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="Practical Details" heading="What You Need to Know" />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {practicals.map(({ icon, label, value }) => (
              <StaggerItem key={label} className="card text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <p className="section-label mb-1">{label}</p>
                <p className="text-sm text-slate font-sans leading-relaxed">{value}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <FadeInSection>
            <div className="text-center mt-10">
              <Link href="#inquire" className="btn-primary">
                Inquire About Trips
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        <StaggerChildren className="contents">
          {missionPhotos.map(({ src, alt }, index) => (
            <StaggerItem key={src} className="relative overflow-hidden">
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
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-colors" />
              </button>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>
      <Lightbox images={missionPhotos} activeIndex={lightbox.activeIndex} onClose={lightbox.close} />

      {/* ── Inquire ── */}
      <section id="inquire" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <SectionHeading
            align="left"
            label="Start Here"
            heading="Inquire About Trips"
            headingClassName="section-heading mb-4"
            subheading="Tell us a bit about yourself and what's drawing you toward this, and our missions team will follow up with upcoming trip details."
            subheadingClassName="text-slate leading-relaxed text-sm font-sans"
          />

          <FadeInSection>
            <ProgramInquiryForm
              program="missions"
              fields={fields}
              submitLabel="Inquire About Trips"
              successTitle="Thank You"
              successBody="Our missions team will follow up with upcoming trip dates and next steps."
            />
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
