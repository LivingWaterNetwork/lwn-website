"use client";

import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";
import { SectionHeading } from "@/components/motion/SectionHeading";

const topics = [
  { icon: "⚓", title: "Formation Before Activation", desc: "Why the leaders we're sending are burning out — and what it looks like to be formed before you're sent." },
  { icon: "🕊️", title: "Spiritual Formation for Leaders", desc: "The six spheres of whole-person formation — spiritual, mental, emotional, physical, relational, stewardship." },
  { icon: "💼", title: "Marketplace Ministry", desc: "Operating as a Kingdom agent in business and the marketplace — bridging the ministry/marketplace gap." },
  { icon: "🔥", title: "From Prison to Purpose", desc: "Omar's own story of formation, restoration, and calling — a testimony-driven message for churches and retreats." },
];

const steps = [
  { step: "01", title: "Tell Us About Your Event", desc: "Share the event, date, audience, and topic below." },
  { step: "02", title: "We Confirm Availability", desc: "Our team follows up to confirm dates and talk through the right message for your audience." },
  { step: "03", title: "We Prepare Together", desc: "A short call beforehand to make sure the message lands for your specific context — church, conference, or company." },
  { step: "04", title: "The Engagement", desc: "A message rooted in Scripture, shaped by experience, and delivered to ignite Kingdom vision in your room." },
];

const fields: ProgramField[] = [
  {
    type: "text",
    id: "eventName",
    label: "Event name",
    required: true,
    placeholder: "e.g. Fall Leadership Retreat",
  },
  {
    type: "text",
    id: "eventDate",
    label: "Event date (approximate)",
    placeholder: "e.g. October 2026, or a specific date",
  },
  {
    type: "text",
    id: "audienceSize",
    label: "Expected audience size",
    placeholder: "e.g. 50, 200, 500+",
  },
  {
    type: "textarea",
    id: "topic",
    label: "What would you like our speaker to speak on?",
    required: true,
    placeholder: "Share the theme, the audience, and anything else that would help us prepare the right message.",
    rows: 5,
  },
];

export function SpeakingContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/omar-speaking-stage.jpg"
            alt="Omar Fandino addressing a large leadership event"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">Bringing the Message to You</p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
              <RevealText text="Request a Speaker" delay={0.15} />
            </h1>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
              Dynamic speaking for churches, conferences, retreats, and corporate leadership events.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.35}>
            <div className="mt-8">
              <Link href="#inquire" className="btn-primary">
                Request a Speaker
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            label="Why Book Us"
            heading="A Message Built From Experience, Not a Slide Deck"
            headingClassName="section-heading mb-6"
          />
          <FadeInSection delay={0.15}>
            <p className="text-slate font-sans text-base leading-relaxed">
              Living Water Network offers dynamic speaking engagements for churches, conferences,
              retreats, and corporate leadership events. Our messages are rooted in Scripture,
              shaped by experience, and delivered to ignite Kingdom vision in whatever context
              we&apos;re invited into. If your organization is looking for a speaker who can bridge
              the ministry and marketplace gap, we&apos;d love to connect.
            </p>
            <blockquote className="mt-8 font-serif text-xl md:text-2xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left max-w-xl mx-auto">
              &ldquo;I don&apos;t get on a stage to perform a testimony. I get on a stage because
              someone in that room is living through what I survived, and they need to know
              it&apos;s survivable.&rdquo;
              <cite className="block mt-3 text-sm not-italic text-slate/60 font-sans">
                — Omar J. Fandino, Founder of Living Water Network{" "}
                <span className="text-copper">· echoes 2 Corinthians 1:4</span>
              </cite>
            </blockquote>
          </FadeInSection>
        </div>
      </section>

      {/* ── Topics ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="Topics We Speak On" heading="Messages That Fit Your Room" />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topics.map(({ icon, title, desc }) => (
              <StaggerItem key={title} className="card text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-serif text-base font-semibold text-navy mb-2">{title}</h3>
                <p className="text-xs text-slate font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-12" label="How It Works" heading="From Request to the Stage" />
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
              <Link href="#inquire" className="btn-primary">
                Request a Speaker
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        <StaggerChildren className="contents">
          {[
            { src: "/images/omar-speaking-main-stage.jpg", alt: "Omar Fandino speaking at a leadership event" },
            { src: "/images/omar-speaking-vip.jpg", alt: "Omar Fandino at a speaking engagement" },
            { src: "/images/leadership-group-backstage.jpg", alt: "Backstage at a leadership event" },
            { src: "/images/omar-speaking-tech.jpg", alt: "Omar Fandino speaking on stage" },
          ].map(({ src, alt }) => (
            <StaggerItem key={src} className="relative overflow-hidden">
              <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-navy/20" />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── Inquire ── */}
      <section id="inquire" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <SectionHeading
            align="left"
            label="Start Here"
            heading="Request a Speaker"
            headingClassName="section-heading mb-4"
            subheading="Tell us about your event below, and our team will follow up to confirm availability and talk through the right message for your audience."
            subheadingClassName="text-slate leading-relaxed text-sm font-sans"
          />

          <FadeInSection>
            <ProgramInquiryForm
              program="speaking"
              fields={fields}
              submitLabel="Request a Speaker"
              successTitle="Request Received"
              successBody="Thank you for the invitation — our team will follow up to confirm availability and details."
            />
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
