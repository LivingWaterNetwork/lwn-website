import Image from "next/image";
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
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-[#00466F] opacity-95" />
        {/* water ripple rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-white/5 absolute" />
          <div className="w-[900px] h-[900px] rounded-full border border-white/5 absolute" />
          <div className="w-[1200px] h-[1200px] rounded-full border border-white/5 absolute" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40 text-center">
          <p className="section-label text-spring mb-4">
            Living Water Network
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-white leading-tight max-w-3xl mx-auto">
            Equipping Kingdom leaders to disrupt darkness and disciple nations.
          </h1>
          <p className="mt-6 text-white/70 text-lg max-w-xl mx-auto leading-relaxed font-sans">
            Spiritual formation, discipleship, and leadership development for
            those called to lead — in ministry and the marketplace.
          </p>
          <p className="mt-4 font-serif italic text-spring text-xl md:text-2xl">
            Rooted in truth. Sent to lead.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cohort" className="btn-copper text-base px-8 py-3.5">
              Join the Network
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md border-2 border-white/40 text-white font-semibold font-sans text-base transition-colors hover:border-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
      <section className="py-20 bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">What We Offer</p>
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

      {/* ── Impact photo strip ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-3 text-center">See the Impact</p>
          <h2 className="section-heading mb-10 text-center">Transformation Happens Here</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/baptism-pool.jpg" alt="Baptism ministry" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square md:col-span-2">
              <Image src="/images/omar-speaking-stage.jpg" alt="Omar speaking at a major event" fill className="object-cover object-center hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/prayer-ministry.jpg" alt="Prayer ministry" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/mission-trip-bus.jpg" alt="International mission trip" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/prayer-circle.jpg" alt="Leaders praying together" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/baptism-closeup.jpg" alt="Water baptism" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <Image src="/images/omar-speaking-vip.jpg" alt="Omar speaking at a VIP event" fill className="object-cover object-top hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-20 bg-[#00466F] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label text-spring mb-4">Testimonials</p>
          <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed text-white/90 mb-6">
            &ldquo;Living Water Network gave me the space to be reformed before I could
            ever hope to reform others.&rdquo;
          </blockquote>
          <p className="text-white/50 text-sm font-sans">
            — Cohort Participant{" "}
            <span className="text-white/30 italic">(placeholder — swap with real testimonial)</span>
          </p>
        </div>
      </section>

      {/* ── CTA banners ── */}
      <CtaBanner />
    </>
  );
}
