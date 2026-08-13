"use client";

import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";
import { SectionHeading } from "@/components/motion/SectionHeading";

const focusSpheres = [
  { name: "Presence", desc: "Spiritual health — reconnecting prayer and Scripture to real life, not just routine." },
  { name: "Heart", desc: "Emotional health — processing wounds, burnout, and the places performance has covered up pain." },
  { name: "Community", desc: "Relational health — restoring the connection leadership tends to isolate you from first." },
];

const steps = [
  { step: "01", title: "Share What's On Your Heart", desc: "Fill out the form below — burnout, a specific season, a relationship, or something else entirely." },
  { step: "02", title: "We Reach Out Within 24–48 Hours", desc: "A member of our pastoral care team follows up personally to schedule a first conversation. No pressure, just a starting point." },
  { step: "03", title: "A First Conversation", desc: "An honest, unhurried conversation about your season and what care could look like for you." },
  { step: "04", title: "Ongoing Sessions", desc: "One-on-one sessions built around your pace and your needs — spiritual, emotional, and relational care together." },
];

const fields: ProgramField[] = [
  {
    type: "textarea",
    id: "support",
    label: "What would you like support with?",
    required: true,
    placeholder: "Share what's on your heart — burnout, a specific season, a relationship, or something else entirely.",
    rows: 6,
  },
];

export function CounselingContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/prayer-circle.jpg"
            alt="A small group praying together quietly"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">Healing That Empowers</p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
              <RevealText text="Personalized Counseling" delay={0.15} />
            </h1>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
              Great leaders need great care. Let&apos;s talk about what wholeness could look like
              for you.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.35}>
            <div className="mt-8">
              <Link href="#apply" className="btn-primary">
                Request Counseling
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 bg-white">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6 max-w-xl mx-auto">
            <Image
              src="/images/prayer-small-group.jpg"
              alt="A small group praying together quietly, hands on each other's shoulders"
              fill
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <p className="text-slate leading-relaxed text-sm font-sans text-center max-w-2xl mx-auto">
            Our personalized counseling sessions go beyond coaching to address the spiritual, emotional,
            and relational dimensions of leadership. Through one-on-one engagements tailored to your unique
            season and challenges, we help leaders process wounds, overcome burnout, and rediscover the joy
            of serving from a place of wholeness rather than depletion.
          </p>
        </FadeInSection>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            label="Why This Isn't Just Talk Therapy"
            heading="Care Rooted in Scripture, Not Just Technique"
            headingClassName="section-heading mb-6"
          />
          <FadeInSection delay={0.15}>
            <p className="text-slate font-sans text-base leading-relaxed">
              This is discipleship-based pastoral care — someone walking with you through the
              spiritual and emotional weight of leadership, not a clinical intake process. It
              doesn&apos;t replace licensed therapy where that&apos;s needed, but it offers
              something a clinical hour often can&apos;t: a shared faith, and a relationship that
              continues beyond a diagnosis.
            </p>
            <blockquote className="mt-8 font-serif text-xl md:text-2xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left max-w-xl mx-auto">
              &ldquo;I didn&apos;t need someone to fix me. I needed someone who wouldn&apos;t
              flinch at what needed healing — and stayed anyway.&rdquo;
              <cite className="block mt-3 text-sm not-italic text-slate/60 font-sans">
                — Omar J. Fandino, Founder of Living Water Network{" "}
                <span className="text-copper">· echoes Psalm 34:18</span>
              </cite>
            </blockquote>
          </FadeInSection>
        </div>
      </section>

      {/* ── What Counseling Focuses On ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-10"
            label="What Counseling Focuses On"
            heading="Care for the Whole Person"
            subheading="Three of the same six spheres of formation taught in At the Table, LWN's proprietary formation guide — the ones counseling is built to address directly."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-xl mx-auto"
          />
          <StaggerChildren className="grid sm:grid-cols-3 gap-5">
            {focusSpheres.map(({ name, desc }) => (
              <StaggerItem key={name} className="card text-center">
                <h3 className="font-serif text-lg font-semibold text-navy mb-2">{name}</h3>
                <p className="text-xs text-slate font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-12" label="What to Expect" heading="From Reaching Out to Ongoing Care" />
          <StaggerChildren className="grid sm:grid-cols-2 gap-6">
            {steps.map(({ step, title, desc }) => (
              <StaggerItem key={step} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-navy text-spring font-serif font-semibold flex items-center justify-center text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-navy mb-1">{title}</h3>
                  <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <FadeInSection>
            <div className="text-center mt-10">
              <Link href="#apply" className="btn-primary">
                Request Counseling
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        <StaggerChildren className="contents">
          {[
            { src: "/images/apartment-prayer-circle.jpg", alt: "Pastoral prayer and care" },
            { src: "/images/baptism-closeup.jpg", alt: "Spiritual restoration and renewal" },
            { src: "/images/outreach-group.jpg", alt: "Community care and support" },
            { src: "/images/prayer-restaurant.jpg", alt: "One-on-one pastoral conversation" },
          ].map(({ src, alt }) => (
            <StaggerItem key={src} className="relative overflow-hidden">
              <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-navy/20" />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── Apply ── */}
      <section id="apply" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <SectionHeading
            align="left"
            label="Start Here"
            heading="Request Counseling"
            headingClassName="section-heading mb-4"
            subheading="Fill out the form and a member of our pastoral care team will reach out within 24-48 hours to schedule a first conversation. No pressure, just a starting point."
            subheadingClassName="text-slate leading-relaxed text-sm font-sans"
          />

          <FadeInSection>
            <ProgramInquiryForm
              program="counseling"
              fields={fields}
              submitLabel="Request Counseling"
              successTitle="We've Received Your Request"
              successBody="Someone from our pastoral care team will reach out within 24-48 hours. Thank you for trusting us with this."
              disclaimer="Please note: our counseling is discipleship-based pastoral care, not therapy provided by licensed or certified counselors. If you're looking for licensed clinical care, we're glad to help you find additional resources."
            />
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
