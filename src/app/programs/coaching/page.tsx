import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// Structurally the same as the sibling program pages, which hit a static-
// generation build timeout on Vercel — force-dynamic defensively for the
// same reason (see CLAUDE_HANDOFF.txt Section 7).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal Coaching with Omar Fandino",
  description:
    "One-on-one Christian leadership coaching built around Living Water Network's Six Spheres formation framework — spiritual, mental, emotional, physical, relational, and stewardship health, tailored to you.",
  openGraph: {
    title: "Personal Coaching | Living Water Network",
    description:
      "One-on-one coaching built around LWN's Six Spheres formation framework — the same model behind Groundwork, tailored to your life.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Coaching | Living Water Network",
    description:
      "One-on-one coaching built around LWN's Six Spheres formation framework — the same model behind Groundwork, tailored to your life.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

const spheres = [
  { num: "01", name: "Spiritual", groundworkName: "Presence", desc: "Prayer, Sabbath, Scripture, and obedience — the rhythms that keep you tethered to God, not just informed about Him." },
  { num: "02", name: "Mental", groundworkName: "Mind", desc: "Renewing the thought life — the beliefs and patterns actually driving your decisions under pressure." },
  { num: "03", name: "Emotional", groundworkName: "Heart", desc: "The hidden places — grief, wounds, and blind spots that quietly shape how you lead and relate." },
  { num: "04", name: "Physical", groundworkName: "Body", desc: "Honoring the vessel God gave you — energy, rest, and health sized to the weight you're actually carrying." },
  { num: "05", name: "Relational", groundworkName: "Community", desc: "Being known and truly knowing others — marriage, family, and the relationships leadership tends to starve first." },
  { num: "06", name: "Stewardship", groundworkName: "Stewardship", desc: "Calling, gifts, time, money, and the legacy you're actually building, not just the one you talk about." },
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

const journey = [
  {
    step: "Inquire",
    title: "Tell Us Where You Are",
    desc: "Fill out the form below. Omar reviews every inquiry personally — this isn't routed to a sales team.",
  },
  {
    step: "Assess",
    title: "Intake & Discovery Assessment",
    desc: "A guided conversation and assessment across all six spheres before any plan gets built.",
  },
  {
    step: "Build",
    title: "Your Plan, Built From Your Assessment",
    desc: "Omar builds your coaching plan around what your six-sphere assessment actually shows — sequenced, not scattered.",
  },
  {
    step: "Walk",
    title: "Sessions, Access, and Accountability",
    desc: "Weekly or biweekly sessions depending on your package, with direct access between calls for the moments that can't wait.",
  },
  {
    step: "Review",
    title: "Review & Next Season",
    desc: "At the close of your engagement, review what shifted across all six spheres and decide what the next season needs.",
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
    label: "What season are you in, and what would you want coaching to help you move toward?",
    required: true,
    placeholder: "Share honestly — this is what Omar reviews before your first session.",
    rows: 6,
  },
];

export default function CoachingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/omar-with-colleague.jpg"
            alt="Omar Fandino in a one-on-one coaching conversation"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">One-on-One Formation</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
            Personal Coaching
          </h1>
          <p className="text-white/50 font-sans text-sm tracking-widest uppercase mb-5">
            With Omar Fandino, Founder of Living Water Network
          </p>
          <p className="text-white/70 text-lg font-sans max-w-2xl mx-auto leading-relaxed">
            The same Six Spheres formation model behind Groundwork — built one-on-one, around
            your actual life, not a cohort calendar.
          </p>
          <div className="mt-8">
            <Link href="#inquire" className="btn-primary">
              Start With an Inquiry
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why this exists ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-label mb-3">Why This Exists</p>
            <h2 className="section-heading">Leaders Rarely Get Coached the Way They Coach Others</h2>
          </div>
          <div className="space-y-4 text-slate font-sans text-base leading-relaxed">
            <p>
              Most leaders know how to pour out. Fewer have someone speaking honestly into their
              own spiritual health, their own thought life, their own marriage, their own body,
              their own calling — at the same time, instead of one at a time whenever there&apos;s
              a crisis.
            </p>
            <p className="text-center font-serif text-xl text-navy py-4 border-l-4 border-copper pl-6 text-left">
              &ldquo;Before the water flows through you, the ground must be prepared&rdquo; — the
              conviction behind Groundwork holds just as true one-on-one as it does in a cohort of
              twelve.
            </p>
            <p>
              Personal coaching takes that same formation model and builds it entirely around
              you — your season, your history, your calling — with the direct access and
              accountability a cohort format can&apos;t provide.
            </p>
          </div>
        </div>
      </section>

      {/* ── Six Spheres ── */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label text-spring mb-3">The Framework</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white">
              The Six Spheres
            </h2>
            <p className="mt-3 text-white/60 font-sans text-sm max-w-2xl mx-auto">
              The same six-pillar model taught in <em>At the Table</em>, LWN&apos;s proprietary
              formation guide — applied here to your individual assessment, not a shared
              curriculum.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spheres.map(({ num, name, groundworkName, desc }) => (
              <div
                key={num}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors"
              >
                <p className="text-copper text-xs font-semibold font-sans mb-1">Sphere {num}</p>
                <p className="text-white font-serif text-lg font-semibold mb-1">
                  {name}
                  <span className="text-white/35 text-xs font-sans font-normal ml-2 uppercase tracking-wide">
                    Groundwork: {groundworkName}
                  </span>
                </p>
                <p className="text-white/55 text-sm font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-3">What&apos;s Included</p>
            <h2 className="section-heading">Every Engagement Starts the Same Way</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {included.map(({ tag, title, desc }) => (
              <div key={title} className="card">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-white bg-copper rounded-full px-3 py-1 mb-3">
                  {tag}
                </span>
                <h3 className="font-serif text-lg font-semibold text-navy mb-2">{title}</h3>
                <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">How It Works</p>
            <h2 className="section-heading">From Inquiry to Next Season</h2>
          </div>
          <div className="space-y-0">
            {journey.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-5 py-5 border-b border-mist last:border-none">
                <div className="shrink-0 w-11 h-11 rounded-full bg-navy text-spring font-serif font-semibold flex items-center justify-center text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="text-copper text-xs font-semibold font-sans uppercase tracking-widest mb-1">
                    {step}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-navy mb-1">{title}</h3>
                  <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Choose Your Path</p>
            <h2 className="section-heading">Three Ways to Work With Omar</h2>
            <p className="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto">
              Every package is built around the same Six Spheres assessment — the difference is
              depth and duration. Investment is discussed directly once we understand your
              situation; payment plans and a limited number of scholarship spots are available
              for clients referred by partner churches.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        {[
          { src: "/images/omar-headshot-pro.jpg", alt: "Omar Fandino" },
          { src: "/images/prayer-circle.jpg", alt: "One-on-one prayer and coaching conversation" },
          { src: "/images/apartment-prayer-circle.jpg", alt: "Personal formation conversation" },
          { src: "/images/omar-community-event.jpg", alt: "Omar Fandino at a community event" },
        ].map(({ src, alt }) => (
          <div key={src} className="relative overflow-hidden">
            <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-navy/20" />
          </div>
        ))}
      </section>

      {/* ── Inquiry ── */}
      <section id="inquire" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="section-label mb-3">Start Here</p>
            <h2 className="section-heading mb-4">Request a Coaching Conversation</h2>
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
        </div>
      </section>
    </>
  );
}
