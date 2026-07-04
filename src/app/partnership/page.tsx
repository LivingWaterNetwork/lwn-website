import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Join the Living Water Network partnership circle. Sponsorship tiers, multi-year giving, and ways to invest in the next generation of Kingdom leaders.",
};

const tiers = [
  {
    name: "Cornerstone Partner",
    amount: "$25,000",
    period: "annually",
    tagline: "The foundation of the movement",
    color: "bg-navy text-white",
    accentColor: "text-spring",
    benefits: [
      "Named co-founder recognition on all LWN publications and site",
      "Reserved seating at all LWN events including the annual Gala",
      "Quarterly impact meetings with the Executive Director",
      "Logo placement on website, materials, and cohort curriculum",
      "Annual impact report with full program metrics",
      "First access to partnership opportunities for future cohorts",
    ],
  },
  {
    name: "Kingdom Builder",
    amount: "$10,000",
    period: "annually",
    tagline: "Shaping the next generation",
    color: "bg-[#00466F] text-white",
    accentColor: "text-spring",
    benefits: [
      "Named recognition on website partner page and annual report",
      "Invited to annual Gala with two reserved seats",
      "Bi-annual impact briefings with the LWN leadership team",
      "Logo placement on cohort materials and website",
      "Certificate of partnership and tax receipt",
    ],
  },
  {
    name: "Formation Fellow",
    amount: "$5,000",
    period: "annually",
    tagline: "Investing in leaders who invest in others",
    color: "bg-white border-2 border-navy text-navy",
    accentColor: "text-[#0A77BC]",
    benefits: [
      "Named recognition on the LWN website partner page",
      "Invitation to annual Gala",
      "Annual impact update and program report",
      "Certificate of partnership and tax receipt",
    ],
  },
  {
    name: "Community Sustainer",
    amount: "$1,000 – $2,500",
    period: "annually",
    tagline: "Every gift builds the foundation",
    color: "bg-mist border border-[#0A77BC]/20 text-navy",
    accentColor: "text-[#0A77BC]",
    benefits: [
      "Recognition on the LWN website community page",
      "Annual impact newsletter and program updates",
      "Certificate of appreciation and tax receipt",
    ],
  },
];

const monthlyTiers = [
  { label: "Seed", amount: "$25/mo", desc: "Weekly curriculum materials for one participant" },
  { label: "Root", amount: "$50/mo", desc: "One facilitated group formation session per month" },
  { label: "Branch", amount: "$100/mo", desc: "Full month of coaching and community for one leader" },
  { label: "Vine", amount: "$250/mo", desc: "Meaningful investment toward one leader's formation journey" },
];

const roadmap = [
  {
    phase: "Year 1 (2026–2027)",
    goal: "$50,000",
    focus: "Launch inaugural cohort, establish curriculum and pastoral team",
  },
  {
    phase: "Year 2 (2027–2028)",
    goal: "$100,000",
    focus: "Scale to two cohorts, expand missions program",
  },
  {
    phase: "Year 3–5 (2028–2031)",
    goal: "$150,000/yr",
    focus: "Full operational capacity — 3–5 cohorts annually, national reach",
  },
];

export default function PartnershipPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-navy py-24 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">Partner With Us</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Invest in the Leaders<br />
            <span className="italic">Who Change the World</span>
          </h1>
          <p className="text-white/65 font-sans text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Living Water Network is building a multi-year funding base to equip Kingdom leaders
            across ministry and the marketplace. Your partnership doesn&apos;t just fund a program —
            it multiplies Kingdom impact for generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tiers"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-copper hover:bg-[#a34d10] text-white font-semibold font-sans text-sm rounded-md transition-colors"
            >
              View Partnership Tiers
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/40 hover:border-white text-white font-semibold font-sans text-sm rounded-md transition-colors hover:bg-white/10"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Partner ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">The Vision</p>
            <h2 className="section-heading">Why This Matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                stat: "100,000",
                label: "Kingdom leaders",
                desc: "Our 5-year goal — leaders transformed and released into ministry and marketplace",
              },
              {
                stat: "$3K–$5K",
                label: "per leader",
                desc: "The full cost of the Groundwork program — a 9-month journey of formation, coaching, and missions",
              },
              {
                stat: "3–5 yrs",
                label: "of impact",
                desc: "Our funding roadmap — building sustainable capacity to serve cohorts year after year",
              },
            ].map(({ stat, label, desc }) => (
              <div key={stat} className="bg-mist rounded-2xl p-8">
                <p className="font-serif text-4xl font-semibold text-navy">{stat}</p>
                <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-[#0A77BC] mt-1 mb-3">
                  {label}
                </p>
                <p className="text-slate text-sm font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Annual Tiers ── */}
      <section id="tiers" className="py-20 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Annual Partnership</p>
            <h2 className="section-heading">Choose Your Level of Investment</h2>
            <p className="text-slate font-sans text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              All partnerships are renewable annually. Multi-year pledges are available — see below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tiers.map(({ name, amount, period, tagline, color, accentColor, benefits }) => (
              <div
                key={name}
                className={`rounded-2xl p-7 shadow-sm ${color}`}
              >
                <p className={`text-xs font-extrabold font-sans uppercase tracking-widest mb-2 ${accentColor}`}>
                  {tagline}
                </p>
                <h3 className="font-serif text-2xl font-semibold leading-tight mb-1">{name}</h3>
                <p className="font-sans text-3xl font-bold mb-1">{amount}</p>
                <p className="font-sans text-xs opacity-60 mb-5 uppercase tracking-wide">{period}</p>
                <ul className="space-y-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm font-sans opacity-80 leading-relaxed">
                      <span className="mt-0.5 shrink-0">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Monthly giving ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Formation Circle</p>
            <h2 className="section-heading">Give Monthly. Change Everything.</h2>
            <p className="text-slate font-sans text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Recurring gifts are the backbone of our operating budget. Every monthly member
              makes it possible to plan, hire, and expand with confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyTiers.map(({ label, amount, desc }) => (
              <div
                key={label}
                className="bg-mist rounded-xl p-5 border border-white hover:border-[#0A77BC]/30 hover:shadow-sm transition-all text-center"
              >
                <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-[#0A77BC] mb-1">
                  {label}
                </p>
                <p className="font-serif text-2xl font-semibold text-navy mb-2">{amount}</p>
                <p className="text-slate text-xs font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/donate" className="btn-copper">
              Start Monthly Giving
            </Link>
          </div>
        </div>
      </section>

      {/* ── Multi-year pledge ── */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label text-spring mb-4">Multi-Year Commitment</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight mb-6">
            Build Something That Lasts
          </h2>
          <p className="text-white/65 font-sans text-lg leading-relaxed mb-12">
            Multi-year pledges allow LWN to plan with confidence — hiring staff,
            building curriculum, and launching new cohorts. Partners who commit for
            3–5 years receive elevated recognition and access throughout the partnership.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {roadmap.map(({ phase, goal, focus }) => (
              <div key={phase} className="bg-white/5 border border-white/10 rounded-xl p-5 text-left">
                <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-copper mb-2">
                  {phase}
                </p>
                <p className="font-serif text-2xl font-semibold text-white mb-2">{goal}</p>
                <p className="text-white/50 text-xs font-sans leading-relaxed">{focus}</p>
              </div>
            ))}
          </div>

          <Link href="/contact" className="btn-copper">
            Discuss a Multi-Year Pledge
          </Link>
        </div>
      </section>

      {/* ── Quote divider ── */}
      <section className="py-16 bg-[#00466F] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <blockquote className="font-serif text-2xl md:text-3xl italic text-white leading-relaxed">
            &ldquo;Whoever believes in me, as Scripture has said, rivers of living water will flow from within them.&rdquo;
          </blockquote>
          <p className="mt-4 text-spring text-sm font-semibold font-sans tracking-widest uppercase">
            John 7:38
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-mist">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="section-label mb-3">Ready to Partner?</p>
          <h2 className="section-heading mb-4">Let&apos;s Start the Conversation</h2>
          <p className="text-slate font-sans text-sm leading-relaxed max-w-lg mx-auto mb-8">
            Whether you&apos;re ready to commit at a specific tier or just want to learn more
            about what your gift makes possible — we&apos;d love to connect. Reach out and our
            team will respond within 24–48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-copper">
              Contact Our Team
            </Link>
            <Link href="/donate" className="btn-secondary">
              Give Now
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate/60 font-sans">
            Living Water Network Inc. is a registered 501(c)(3) nonprofit.
            All gifts are tax-deductible to the extent allowed by law.
          </p>
        </div>
      </section>
    </>
  );
}
