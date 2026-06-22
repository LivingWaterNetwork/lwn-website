import Link from "next/link";
import { ProgramCard } from "@/components/sections/ProgramCard";
import { CtaBanner } from "@/components/sections/CtaBanner";

const programs = [
  {
    title: "Immersive Cohorts",
    description:
      "Cohort-based journey in spiritual formation, discipleship, and leadership — designed to transform you from the inside out alongside other leaders.",
    icon: "🌊",
  },
  {
    title: "Personalized Counseling",
    description:
      "One-on-one sessions tailored to your unique leadership challenges, spiritual health, and life calling.",
    icon: "🧭",
  },
  {
    title: "Strategic Mentorships",
    description:
      "Pairing emerging and seasoned leaders for intentional, Spirit-led mentorship that accelerates Kingdom impact.",
    icon: "🤝",
  },
  {
    title: "Public Speaking",
    description:
      "Dynamic engagements that equip congregations, conferences, and organizations with Kingdom vision.",
    icon: "🎤",
  },
  {
    title: "Mission Trips",
    description:
      "International experiences designed to broaden your global perspective and deepen your Kingdom mandate.",
    icon: "✈️",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-teal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-dark via-teal to-teal-light opacity-90" />
        {/* decorative water ripple rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-white/5 absolute" />
          <div className="w-[900px] h-[900px] rounded-full border border-white/5 absolute" />
          <div className="w-[1200px] h-[1200px] rounded-full border border-white/5 absolute" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4">
            Living Water Network
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight max-w-3xl mx-auto">
            Equipping Kingdom leaders to disrupt darkness and disciple nations.
          </h1>
          <p className="mt-6 text-white/75 text-lg max-w-xl mx-auto leading-relaxed">
            Spiritual formation, discipleship, and leadership development for
            those called to lead — in ministry and the marketplace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cohort" className="btn-gold text-base px-8 py-3.5">
              Join the Network
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md border-2 border-white/50 text-white font-semibold text-base transition-colors hover:border-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
            Our Mission
          </p>
          <h2 className="section-heading mb-8">Impacting 100,000 Kingdom Leaders</h2>
          <div className="prose prose-lg text-charcoal/80 font-sans leading-relaxed mx-auto text-left space-y-4">
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
              Through immersive cohorts, personalized counseling, and strategic mentorships,
              we empower leaders to return to their communities restored, equipped, and
              inspired to spark meaningful change. In addition to these core programs, we
              offer dynamic public speaking engagements and international mission trips
              designed to broaden perspectives and deepen global Kingdom impact.
            </p>
          </div>
        </div>
      </section>

      {/* ── Programs overview ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              What We Offer
            </p>
            <h2 className="section-heading">Programs Built to Transform</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <ProgramCard key={p.title} {...p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/programs" className="btn-secondary">
              Explore All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social proof / placeholder photo section ── */}
      <section className="py-20 bg-teal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed text-white/90 mb-6">
            &ldquo;Living Water Network gave me the space to be reformed before I could
            ever hope to reform others.&rdquo;
          </blockquote>
          <p className="text-white/60 text-sm">
            — Cohort Participant{" "}
            <span className="text-white/40 italic">(placeholder — swap with real testimonial)</span>
          </p>
        </div>
      </section>

      {/* ── CTA banners ── */}
      <CtaBanner />
    </>
  );
}
