"use client";

import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { RevealText } from "@/components/motion/RevealText";
import { Lightbox, useLightbox } from "@/components/motion/Lightbox";

const spheres = [
  { num: "01", name: "Spiritual", groundworkName: "Presence", desc: "Prayer, Sabbath, Scripture, and obedience — the rhythms that keep you tethered to God, not just informed about Him." },
  { num: "02", name: "Mental", groundworkName: "Mind", desc: "Renewing the thought life — the beliefs and patterns actually driving your decisions under pressure." },
  { num: "03", name: "Emotional", groundworkName: "Heart", desc: "The hidden places — grief, wounds, and blind spots that quietly shape how you lead and relate." },
  { num: "04", name: "Physical", groundworkName: "Body", desc: "Honoring the vessel God gave you — energy, rest, and health sized to the weight you're actually carrying." },
  { num: "05", name: "Relational", groundworkName: "Community", desc: "Being known and truly knowing others — marriage, family, and the relationships leadership tends to starve first." },
  { num: "06", name: "Stewardship", groundworkName: "Stewardship", desc: "Calling, gifts, time, money, and the legacy you're actually building, not just the one you talk about." },
];

const framework = [
  {
    letter: "S",
    word: "See",
    subtitle: "Intake & Discovery Assessment",
    desc: "Before any plan gets built, you see your six spheres honestly — where you actually are, not where you assume you are. Reviewed by Omar personally before session one.",
  },
  {
    letter: "S",
    word: "Sit",
    subtitle: "Weekly or Biweekly Sessions",
    desc: "You don't skip the Table to get to the Field. Sessions do the slow work of formation across whichever spheres your assessment shows need it most — sequenced, not scattered.",
  },
  {
    letter: "S",
    word: "Send",
    subtitle: "Review & Next Season",
    desc: "At the close of your engagement, you review what actually shifted and carry it into how you lead — at work, at home, in ministry — not back into old patterns.",
  },
];

const extendedSupport = [
  {
    sphere: "Physical",
    title: "Training & Nutrition",
    desc: "A personal training plan and nutrition coaching built around your actual schedule and body, not a generic program.",
    icon: "💪",
  },
  {
    sphere: "Physical",
    title: "Hormone Therapy Referrals",
    desc: "For leaders whose energy and health issues go deeper than habits, referrals to trusted providers so the physical sphere gets real medical attention, not just encouragement.",
    icon: "🩺",
  },
  {
    sphere: "Stewardship",
    title: "Business Development",
    desc: "Strategy support for your business or ministry venture — stewarding what God has actually put in your hands, not just talking about calling in the abstract.",
    icon: "📈",
  },
  {
    sphere: "Stewardship",
    title: "Website Review & Edits",
    desc: "A practical audit and hands-on edits to your website or online presence — the same kind of build-and-fix work behind LWN's own site, applied to yours.",
    icon: "🖥️",
  },
];

const included = [
  {
    tag: "Step 1",
    title: "Intake & Discovery Assessment",
    desc: "A guided assessment across all six spheres, reviewed by Omar before your first session — so session one starts with your real picture, not small talk.",
  },
  {
    tag: "Personalized",
    title: "A Plan Built Around the Six Spheres",
    desc: "Not a template. Your plan is built from your own assessment — which spheres need attention now, and which are already load-bearing for the rest.",
  },
  {
    tag: "Access",
    title: "Direct Access Between Sessions",
    desc: "Time-sensitive check-ins with Omar directly between sessions, within reasonable bounds — formation doesn't only happen on the call.",
  },
  {
    tag: "Format",
    title: "In Person or Zoom",
    desc: "Sessions held in person in Atlanta or over Zoom, depending on the package and your location.",
  },
];

const packages = [
  {
    name: "Executive Coaching Intensive",
    format: "One 2-hour strategic session",
    duration: "Single session",
    forWho: "For a leader facing a specific decision, season, or bottleneck who needs focused, honest clarity — not a months-long commitment.",
    accent: "border-copper",
    headerBg: "bg-copper",
  },
  {
    name: "60-Day Coaching Engagement",
    format: "1 in-person kickoff + 8 weekly Zoom calls",
    duration: "60 days",
    forWho: "For a leader ready to work through all six spheres at a sustained pace, with weekly accountability across two months.",
    accent: "border-navy",
    headerBg: "bg-navy",
    featured: true,
  },
  {
    name: "Extended Formation Coaching",
    format: "60-Day Engagement + 8 additional biweekly calls",
    duration: "6 months",
    forWho: "For a leader who wants formation, not just a fix — going deeper on the spheres that take longer than two months to actually shift.",
    accent: "border-deep-sea",
    headerBg: "bg-deep-sea",
  },
];

const fields: ProgramField[] = [
  {
    type: "select",
    id: "package",
    label: "Which coaching package are you interested in?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "intensive", label: "Executive Coaching Intensive (single session)" },
      { value: "60-day", label: "60-Day Coaching Engagement" },
      { value: "extended", label: "Extended Formation Coaching (6 months)" },
      { value: "not-sure", label: "Not sure yet — help me choose" },
    ],
  },
  {
    type: "textarea",
    id: "season",
    label: "What's prompting you to look into coaching now?",
    required: true,
    placeholder: "Share honestly — this is what Omar reviews before your first session.",
    rows: 6,
  },
];

const photos = [
  { src: "/images/omar-headshot-pro.jpg", alt: "Omar Fandino" },
  { src: "/images/prayer-circle.jpg", alt: "One-on-one prayer and coaching conversation" },
  { src: "/images/apartment-prayer-circle.jpg", alt: "Personal formation conversation" },
  { src: "/images/omar-community-event.jpg", alt: "Omar Fandino at a community event" },
];

export function CoachingContent() {
  const lightbox = useLightbox();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-28 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/omar-with-colleague.jpg"
            alt="Omar Fandino in a one-on-one coaching conversation"
            fill
            className="object-cover object-center opacity-15"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-4">One-on-One Formation Coaching</p>
          </FadeInSection>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mb-5">
            <RevealText text="You Cannot Pour From an Empty Well." />
          </h1>
          <FadeInSection delay={0.3}>
            <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed">
              Personal coaching with Omar Fandino — one-on-one formation for leaders who are done
              leading from empty, built around the same Six Spheres model behind Groundwork.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="#inquire" className="btn-primary">
                Request a Coaching Conversation
              </Link>
              <Link href="#framework" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white/30 text-white font-semibold font-sans text-sm transition-colors hover:border-white hover:bg-white/10">
                See How It Works
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Problem statement ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            className="mb-6"
            label="The Honest Problem"
            heading="Most Leaders Have No One Pouring Into Them"
          />
          <FadeInSection className="space-y-4 text-slate font-sans text-base leading-relaxed text-left">
            <p>
              You&apos;re the one people come to. The one who prays for others, counsels others,
              carries others. That&apos;s the job, and you don&apos;t resent it — but somewhere
              along the way, no one is doing that for you.
            </p>
            <p>
              So you keep functioning. You keep performing. And the well keeps getting a little
              emptier, one withdrawal at a time, until leading starts to cost more than it should.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            className="mb-6"
            label="Why This Is Different"
            heading="This Isn't Executive Coaching. It's Formation."
          />
          <FadeInSection>
            <p className="text-slate font-sans text-base leading-relaxed">
              Most coaching optimizes what you produce — better habits, sharper strategy, tighter
              execution. There&apos;s a place for that. But if the well itself is dry, better
              output just empties it faster.
            </p>
            <blockquote className="mt-6 font-serif text-xl md:text-2xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left max-w-xl mx-auto">
              &ldquo;Before the water flows through you, the ground must be prepared.&rdquo;
            </blockquote>
            <p className="mt-6 text-slate font-sans text-base leading-relaxed">
              This coaching starts with the ground, not the output — the same conviction behind
              Groundwork, built one-on-one and paced to your actual life.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ── Framework: See. Sit. Send. ── */}
      <section id="framework" className="py-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="How It Works"
            heading="See. Sit. Send."
            subheading="Every engagement — regardless of package — moves through the same three movements."
            labelClassName="section-label text-spring"
            headingClassName="font-serif text-3xl md:text-4xl font-semibold text-white"
            subheadingClassName="mt-3 text-white/60 font-sans text-sm max-w-2xl"
          />
          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {framework.map(({ letter, word, subtitle, desc }, i) => (
              <StaggerItem key={word} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-copper text-white font-serif font-semibold flex items-center justify-center text-lg shrink-0">
                    {letter}
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white">{word}</h3>
                </div>
                <p className="text-copper text-xs font-semibold font-sans uppercase tracking-widest mb-2">
                  {subtitle}
                </p>
                <p className="text-white/60 text-sm font-sans leading-relaxed">{desc}</p>
                {i < framework.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-white/20 text-2xl">
                    →
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Six Spheres ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="The Framework Underneath"
            heading="The Six Spheres"
            subheading={
              "The same six-pillar model taught in At the Table, LWN's proprietary formation guide — applied here to your individual assessment, not a shared curriculum."
            }
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto"
          />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spheres.map(({ num, name, groundworkName, desc }) => (
              <StaggerItem
                key={num}
                className="card border-t-2 border-copper hover:shadow-md transition-shadow"
              >
                <p className="text-copper text-xs font-semibold font-sans mb-1">Sphere {num}</p>
                <p className="text-navy font-serif text-lg font-semibold mb-1">
                  {name}
                  <span className="text-slate/50 text-xs font-sans font-normal ml-2 uppercase tracking-wide">
                    Groundwork: {groundworkName}
                  </span>
                </p>
                <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Beyond Conversation ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-10"
            label="Beyond Conversation"
            heading="Real Resources, Not Just a Weekly Call"
            subheading="Formation isn't only what gets said in a session. Depending on which spheres your assessment surfaces, coaching can plug directly into practical support most coaching programs don't offer."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto"
          />
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {extendedSupport.map(({ sphere, title, desc, icon }) => (
              <StaggerItem key={title} className="card text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <p className="text-copper text-[10px] font-semibold font-sans uppercase tracking-widest mb-2">
                  {sphere} Sphere
                </p>
                <h3 className="font-serif text-base font-semibold text-navy mb-2">{title}</h3>
                <p className="text-xs text-slate font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading className="mb-10" label="What's Included" heading="Every Engagement Starts the Same Way" />
          <StaggerChildren className="grid sm:grid-cols-2 gap-5">
            {included.map(({ tag, title, desc }) => (
              <StaggerItem key={title} className="card">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-white bg-copper rounded-full px-3 py-1 mb-3">
                  {tag}
                </span>
                <h3 className="font-serif text-lg font-semibold text-navy mb-2">{title}</h3>
                <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
          <FadeInSection className="text-center mt-10">
            <Link href="#inquire" className="btn-primary">
              Request a Coaching Conversation
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-12"
            label="By Conversation, Not Checkout"
            heading="Three Ways to Work With Omar"
            subheading="Every package is built around the same Six Spheres assessment — the difference is depth and duration. Because this is one-on-one with Omar directly, availability is limited. Investment is discussed after your Discovery Assessment, once we understand your situation; payment plans and a limited number of scholarship spots are available for clients referred by partner churches."
            subheadingClassName="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto"
          />
          <StaggerChildren className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <StaggerItem
                key={pkg.name}
                className={`rounded-2xl border-2 ${pkg.accent} overflow-hidden flex flex-col bg-white ${
                  pkg.featured ? "md:-mt-3 md:mb-3 shadow-lg" : ""
                }`}
              >
                <div className={`${pkg.headerBg} px-6 py-6 text-white text-center`}>
                  {pkg.featured && (
                    <p className="text-spring text-[10px] font-bold uppercase tracking-widest mb-2">
                      Most Common
                    </p>
                  )}
                  <h3 className="font-serif text-xl font-semibold leading-snug">{pkg.name}</h3>
                  <p className="text-white/60 text-xs font-sans mt-1">{pkg.duration}</p>
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col gap-3">
                  <p className="text-xs font-bold text-navy uppercase tracking-wide font-sans">
                    Format
                  </p>
                  <p className="text-sm text-slate font-sans leading-relaxed -mt-2">{pkg.format}</p>
                  <p className="text-sm text-slate font-sans leading-relaxed mt-auto pt-3 border-t border-mist">
                    {pkg.forWho}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Community photo strip ── */}
      <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        {photos.map(({ src, alt }, index) => (
          <StaggerItem key={src} className="relative overflow-hidden h-full">
            <button
              type="button"
              onClick={() => lightbox.open(index)}
              className="group relative block h-full w-full cursor-zoom-in"
              aria-label={`Expand photo: ${alt}`}
            >
              <Image src={src} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-navy/20" />
            </button>
          </StaggerItem>
        ))}
      </StaggerChildren>
      <Lightbox images={photos} activeIndex={lightbox.activeIndex} onClose={lightbox.close} />

      {/* ── Inquiry ── */}
      <section id="inquire" className="py-16 bg-white">
        <FadeInSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <SectionHeading
              align="left"
              className="mb-4"
              label="Start Here"
              heading="Request a Coaching Conversation"
            />
            <p className="text-slate leading-relaxed text-sm font-sans mb-4">
              Fill out the form and Omar will personally follow up to talk through which package
              fits your season, answer questions, and — if it&apos;s a fit — schedule your Intake
              &amp; Discovery Assessment.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Cost shouldn&apos;t be the reason you don&apos;t ask. Payment plans are available on
              request, and a limited number of scholarship spots are reserved each year for
              clients referred by partner churches.
            </p>
          </div>

          <ProgramInquiryForm
            program="coaching"
            fields={fields}
            submitLabel="Request Coaching Info"
            successTitle="Thank You"
            successBody="Omar will personally review your inquiry and follow up to talk through the right next step."
          />
        </FadeInSection>
      </section>
    </>
  );
}
