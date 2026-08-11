import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christian Leadership Mentorship",
  description:
    "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones — iron sharpening iron, built around accountability and Kingdom vision.",
  openGraph: {
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

const focusAreas = [
  { icon: "🧭", title: "Kingdom Vision Alignment", desc: "Clarifying the calling underneath the job title — what you're actually being formed to do." },
  { icon: "🤝", title: "Accountability", desc: "A relationship, not a check-in — someone who has permission to ask the harder question." },
  { icon: "📖", title: "Wisdom Transfer", desc: "Lessons that only come from someone who has already walked the season you're walking now." },
  { icon: "🌱", title: "Growth in Community", desc: "Formation happens relationally, not just informationally — mentorship is where that plays out." },
];

const steps = [
  { step: "01", title: "Tell Us Where You Are", desc: "Submit the form below — whether you're seeking a mentor, open to mentoring someone else, or not sure which." },
  { step: "02", title: "We Find the Right Fit", desc: "We look at season, calling, and personality to pair mentor and mentee thoughtfully, not just by availability." },
  { step: "03", title: "You Meet and Set the Rhythm", desc: "An initial conversation to set expectations, cadence, and what you're both hoping this relationship becomes." },
  { step: "04", title: "Ongoing, Intentional Relationship", desc: "Regular meetings built around accountability and honest conversation — for as long as it's bearing fruit." },
];

const fields: ProgramField[] = [
  {
    type: "select",
    id: "role",
    label: "Are you seeking a mentor, or interested in mentoring others?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "seeking", label: "Seeking a mentor" },
      { value: "mentoring", label: "Interested in mentoring others" },
      { value: "both", label: "Open to either" },
    ],
  },
  {
    type: "textarea",
    id: "season",
    label: "Tell us about your season and what you're hoping for",
    required: true,
    placeholder: "Where are you right now, and what would a good mentorship relationship help you move toward?",
    rows: 6,
  },
];

export default function MentorshipPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/radical-mentoring-group.jpg"
            alt="Men in a mentoring group"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">Iron Sharpening Iron</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
            Strategic Mentorship
          </h1>
          <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
            Every leader needs a Paul and a Timothy — someone ahead of them, and someone
            they&apos;re helping along.
          </p>
          <div className="mt-8">
            <Link href="#apply" className="btn-primary">
              Submit Your Interest
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6 max-w-xl mx-auto">
            <Image
              src="/images/omar-mentorship-portrait.jpg"
              alt="Omar Fandino with a ministry partner in a black blazer, arm around his shoulder in a playful, confident pose"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-slate leading-relaxed text-sm font-sans max-w-2xl mx-auto text-center">
            We believe every leader needs a Paul and a Timothy — someone ahead of them on the journey and
            someone they are helping along. Our strategic mentorship program pairs seasoned leaders with
            emerging ones for intentional, Spirit-led relationships built around accountability, wisdom
            transfer, and Kingdom vision alignment.
          </p>
        </div>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">Why This Isn&apos;t Just Advice</p>
          <h2 className="section-heading mb-6">This Isn&apos;t a Coffee Chat. It&apos;s a Relationship.</h2>
          <p className="text-slate font-sans text-base leading-relaxed">
            Plenty of leaders can give you advice in a single conversation. Fewer will stay in
            the room long enough to watch whether that advice actually took root — and ask you
            honestly if it didn&apos;t.
          </p>
          <p className="mt-4 text-slate font-sans text-base leading-relaxed">
            This isn&apos;t a curriculum or a one-time conversation. It&apos;s an ongoing
            relationship — the same conviction behind Groundwork&apos;s formation model, lived
            out one relationship at a time.
          </p>
        </div>
      </section>

      {/* ── Focus Areas ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-3">What Mentorship Focuses On</p>
            <h2 className="section-heading">More Than a Coffee Catch-Up</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {focusAreas.map(({ icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-serif text-base font-semibold text-navy mb-2">{title}</h3>
                <p className="text-xs text-slate font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">How It Works</p>
            <h2 className="section-heading">From Interest to Ongoing Relationship</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-navy text-spring font-serif font-semibold flex items-center justify-center text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-navy mb-1">{title}</h3>
                  <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="#apply" className="btn-primary">
              Submit Your Interest
            </Link>
          </div>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        {[
          { src: "/images/team-elevator-selfie.jpg", alt: "Mentorship community and fellowship" },
          { src: "/images/omar-with-colleague.jpg", alt: "Omar Fandino mentoring a colleague" },
          { src: "/images/men-neighborhood-prayer.jpg", alt: "Men's mentoring and prayer gathering" },
          { src: "/images/leadership-group-backstage.jpg", alt: "Leadership community" },
        ].map(({ src, alt }) => (
          <div key={src} className="relative overflow-hidden">
            <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-navy/20" />
          </div>
        ))}
      </section>

      {/* ── Apply ── */}
      <section id="apply" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="section-label mb-3">Start Here</p>
            <h2 className="section-heading mb-4">Submit Your Interest</h2>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Tell us where you are, and we&apos;ll help find the right fit — whether that&apos;s
              a mentor for you, or a mentee who could use what you&apos;ve learned.
            </p>
          </div>

          <ProgramInquiryForm
            program="mentorship"
            fields={fields}
            submitLabel="Submit Interest"
            successTitle="Thank You"
            successBody="We've received your interest and will follow up to talk through the right fit."
          />
        </div>
      </section>
    </>
  );
}
