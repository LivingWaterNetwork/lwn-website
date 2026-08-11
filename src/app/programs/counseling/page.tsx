import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// Force dynamic rendering — this route was hitting Next's 60s static
// generation timeout on Vercel's build machine (3/3 attempts failed,
// blocking the whole deployment). The page has no expensive data
// fetching, so this is a build-time worker/concurrency issue, not a
// content issue. Rendering per-request costs nothing meaningful for a
// low-traffic intake form page and fully removes it from the static
// export step. See CLAUDE_HANDOFF.txt Section 7 for details.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christian Counseling for Leaders",
  description:
    "Discipleship-based counseling for Christian leaders — spiritual, emotional, and relational care that helps you lead from wholeness, not depletion.",
  openGraph: {
    title: "Christian Counseling for Leaders | Living Water Network",
    description:
      "Discipleship-based, pastoral counseling for Christian leaders — spiritual, emotional, and relational care.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Counseling for Leaders | Living Water Network",
    description:
      "Discipleship-based, pastoral counseling for Christian leaders — spiritual, emotional, and relational care.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

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

export default function CounselingPage() {
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
          <p className="section-label text-spring mb-4">Healing That Empowers</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-2">
            Personalized Counseling
          </h1>
          <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
            Great leaders need great care. Let&apos;s talk about what wholeness could look like
            for you.
          </p>
          <div className="mt-8">
            <Link href="#apply" className="btn-primary">
              Request Counseling
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">Why This Isn&apos;t Just Talk Therapy</p>
          <h2 className="section-heading mb-6">Care Rooted in Scripture, Not Just Technique</h2>
          <p className="text-slate font-sans text-base leading-relaxed">
            This is discipleship-based pastoral care — someone walking with you through the
            spiritual and emotional weight of leadership, not a clinical intake process. It
            doesn&apos;t replace licensed therapy where that&apos;s needed, but it offers
            something a clinical hour often can&apos;t: a shared faith, and a relationship that
            continues beyond a diagnosis.
          </p>
        </div>
      </section>

      {/* ── What Counseling Focuses On ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label mb-3">What Counseling Focuses On</p>
            <h2 className="section-heading">Care for the Whole Person</h2>
            <p className="mt-3 text-slate font-sans text-sm max-w-xl mx-auto">
              Three of the same six spheres of formation taught in <em>At the Table</em>, LWN&apos;s
              proprietary formation guide — the ones counseling is built to address directly.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {focusSpheres.map(({ name, desc }) => (
              <div key={name} className="card text-center">
                <h3 className="font-serif text-lg font-semibold text-navy mb-2">{name}</h3>
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
            <p className="section-label mb-3">What to Expect</p>
            <h2 className="section-heading">From Reaching Out to Ongoing Care</h2>
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
              Request Counseling
            </Link>
          </div>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        {[
          { src: "/images/apartment-prayer-circle.jpg", alt: "Pastoral prayer and care" },
          { src: "/images/baptism-closeup.jpg", alt: "Spiritual restoration and renewal" },
          { src: "/images/outreach-group.jpg", alt: "Community care and support" },
          { src: "/images/prayer-restaurant.jpg", alt: "One-on-one pastoral conversation" },
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
            <h2 className="section-heading mb-4">Request Counseling</h2>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Fill out the form and a member of our pastoral care team will reach out within
              24-48 hours to schedule a first conversation. No pressure, just a starting point.
            </p>
          </div>

          <ProgramInquiryForm
            program="counseling"
            fields={fields}
            submitLabel="Request Counseling"
            successTitle="We've Received Your Request"
            successBody="Someone from our pastoral care team will reach out within 24-48 hours. Thank you for trusting us with this."
            disclaimer="Please note: our counseling is discipleship-based pastoral care, not therapy provided by licensed or certified counselors. If you're looking for licensed clinical care, we're glad to help you find additional resources."
          />
        </div>
      </section>
    </>
  );
}
