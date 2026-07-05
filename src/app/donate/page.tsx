import type { Metadata } from "next";
import { DonateForm } from "@/components/sections/DonateForm";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Living Water Network. Your generosity ignites transformation. Join the Circle and help launch the first cohort.",
};

const tiers = [
  {
    amount: "$25",
    label: "Formation Seed",
    covers: "Curriculum materials for one participant for a week of formation",
    icon: "🌱",
  },
  {
    amount: "$50",
    label: "Session Sponsor",
    covers: "One full group formation session — facilitated by a seasoned leader",
    icon: "🤝",
  },
  {
    amount: "$100",
    label: "Monthly Sustainer",
    covers: "One full month of a leader's Groundwork journey — formation, coaching, and community",
    icon: "📖",
  },
  {
    amount: "$250",
    label: "Phase Builder",
    covers: "A meaningful contribution toward one of three formation phases — moving a leader deeper into their 9-month journey. Includes one ticket to our annual Black Tie Gala.",
    icon: "🔥",
  },
  {
    amount: "$500",
    label: "Missions Sender",
    covers: "Helps fund international missions trip costs for one participant — going where Jesus goes. Includes one ticket to our annual Black Tie Gala.",
    icon: "✈️",
  },
  {
    amount: "$1,000+",
    label: "Scholarship Partner",
    covers: "A major step toward a full Groundwork scholarship — the complete program is $3,000–$5,000 per leader for the full 9-month journey. Includes one ticket to our annual Black Tie Gala.",
    icon: "👑",
  },
];

const programs = [
  {
    name: "Groundwork Formation Cohorts",
    desc: "Our flagship 9-month formation journey. Scholarships are funded by ministry partners so no leader is turned away for financial need.",
    pct: 45,
    color: "bg-navy",
  },
  {
    name: "Pastoral & Therapeutic Support",
    desc: "Licensed therapists and pastoral coaches embedded in every cohort — ensuring leaders receive real care, not just training.",
    pct: 15,
    color: "bg-[#00466F]",
  },
  {
    name: "International Missions",
    desc: "Every cohort sends every participant on an international missions trip. Your gift helps us cover costs for those who cannot.",
    pct: 12,
    color: "bg-copper",
  },
  {
    name: "Staffing, Operations & Development",
    desc: "Full-time and part-time staff leading programs, partnerships, and the annual Gala — plus the infrastructure, insurance, and administration that keeps the network running sustainably.",
    pct: 28,
    color: "bg-[#445563]",
  },
];

export default function DonatePage() {
  return (
    <>
      {/* Header */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Support the Mission</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Your Generosity Ignites Transformation
          </h1>
          <p className="mt-4 text-white/65 text-lg max-w-xl mx-auto font-sans">
            Join the Circle — funding the launch of the first Living Water Network cohort
            and the leaders it will release into the world.
          </p>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-white py-12 border-b border-mist">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { stat: "100,000", label: "Kingdom leaders we aim to impact" },
            { stat: "5 yrs", label: "Timeline for our mission" },
            { stat: "501(c)(3)", label: "All donations are tax-deductible" },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="font-serif text-3xl font-semibold text-navy">{stat}</p>
              <p className="text-sm text-slate mt-1 font-sans">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You're Funding */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Your Impact</p>
            <h2 className="section-heading">What You&apos;re Funding</h2>
            <p className="text-slate font-sans text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Every dollar goes directly to forming and releasing Kingdom leaders.
              Here&apos;s what that looks like in practice.
            </p>
          </div>

          {/* Dollar tier cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {tiers.map(({ amount, label, covers, icon }) => (
              <div
                key={amount}
                className="bg-mist rounded-xl p-5 border border-white hover:border-[#0A77BC]/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-serif text-2xl font-semibold text-navy">{amount}</p>
                  <span className="text-xl">{icon}</span>
                </div>
                <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-[#0A77BC] mb-2">
                  {label}
                </p>
                <p className="text-slate text-sm font-sans leading-relaxed">{covers}</p>
              </div>
            ))}
          </div>

          {/* Program breakdown */}
          <div className="bg-mist rounded-2xl p-8">
            <p className="section-label mb-2">Where It Goes</p>
            <h3 className="font-serif text-2xl text-navy font-semibold mb-6">
              How We Steward Every Dollar
            </h3>
            <div className="space-y-5">
              {programs.map(({ name, desc, pct, color }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-sans font-semibold text-navy text-sm">{name}</p>
                    <p className="font-sans font-bold text-sm text-[#0A77BC]">{pct}%</p>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-slate text-xs font-sans mt-1.5 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate/60 font-sans italic">
              Percentages represent approximate allocation targets. LWN is led by a founding
              full-time Executive Director and a part-time Director of Events &amp; Partnerships —
              real staffing costs are reflected honestly above, not hidden in &ldquo;overhead.&rdquo;
              LWN is committed to full stewardship transparency. Financial reports are available
              upon request.
            </p>
          </div>
        </div>
      </section>

      {/* Donation form */}
      <section className="py-16 bg-mist">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-label mb-2">Give Now</p>
            <h2 className="section-heading">Join the Circle</h2>
            <p className="text-slate font-sans text-sm mt-2">
              Secure giving powered by Stripe. One-time or recurring.
            </p>
          </div>
          <DonateForm />
          <p className="mt-6 text-center text-xs text-slate/60 leading-relaxed font-sans">
            Living Water Network Inc. is a 501(c)(3) nonprofit organization. All
            donations are tax-deductible to the extent allowed by law. You will
            receive an email receipt after your gift is processed.
          </p>
        </div>
      </section>
    </>
  );
}
