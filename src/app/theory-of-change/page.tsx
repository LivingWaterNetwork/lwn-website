import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Theory of Change",
  description:
    "How Living Water Network turns spiritual formation into measurable Kingdom impact — our logic model from inputs to outcomes to lasting change.",
  openGraph: {
    title: "Our Theory of Change | Living Water Network",
    description:
      "How Living Water Network turns spiritual formation into measurable Kingdom impact.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Theory of Change | Living Water Network",
    description:
      "How Living Water Network turns spiritual formation into measurable Kingdom impact.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

const inputs = [
  "LWN staff, pastors & licensed therapists",
  "“At the Table” formation curriculum (proprietary, authored by Omar J. Fandino)",
  "Partner network: churches, Kingdom businesses, missions organizations",
  "Donor & partner funding",
];

const activities = [
  "9-month Groundwork cohort — 3 phases, 3 tracks",
  "Weekly formation groups led by seasoned, formed leaders",
  "Pastoral & therapeutic inner-healing sessions",
  "Local serving placements + international missions trip",
];

const outputs = [
  "Leaders formed per cohort (Shepherd, Builder, Canvas tracks)",
  "Formation groups convened & completion rate",
  "Local service hours logged by participants",
  "Missions trips completed & churches/orgs partnered",
];

const outcomes = [
  "Whole-person health across all 6 pillars: Presence, Mind, Heart, Body, Community, Stewardship",
  "Clarified calling, gifts, and vocational direction",
  "Healed inner life — identity rooted in Christ, not performance",
  "Active Kingdom leadership in ministry, marketplace, or creative spheres",
];

const impact = [
  "100,000 Kingdom leaders equipped over 5 years",
  "Healthier, more resilient churches and Kingdom-minded businesses",
  "Discipleship that multiplies across generations and nations",
  "Darkness disrupted; nations discipled",
];

const stages = [
  { label: "Inputs", sub: "What we invest", items: inputs, color: "bg-navy", text: "text-spring" },
  { label: "Activities", sub: "What we do", items: activities, color: "bg-deep-sea", text: "text-spring" },
  { label: "Outputs", sub: "What we track", items: outputs, color: "bg-copper", text: "text-white/80" },
  { label: "Outcomes", sub: "What changes in the leader", items: outcomes, color: "bg-navy", text: "text-spring" },
  { label: "Impact", sub: "What changes in the world", items: impact, color: "bg-deep-sea", text: "text-spring" },
];

const assumptions = [
  {
    title: "Formation precedes activation",
    body: "A leader sent before being formed will eventually lead from the same wounds and blind spots they started with. Healing and identity work must come before deployment — not after.",
  },
  {
    title: "Community is the container for change",
    body: "Transformation happens best in small, accountable community — not in isolation or one-time events. Every phase of Groundwork is designed around relationship, not content delivery alone.",
  },
  {
    title: "Practice forms people, not information",
    body: "Knowing more does not make a leader more formed. Repeated practice — prayer, confession, service, accountability — is what changes how a person actually lives.",
  },
  {
    title: "Formed leaders multiply",
    body: "A leader who has been genuinely formed does not just perform better — they reproduce the same formation in others, which is how 100,000 becomes possible without LWN doing it alone.",
  },
];

export default function TheoryOfChangePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-24 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/prayer-restaurant.jpg"
            alt="Leaders in prayer and formation"
            fill
            className="object-cover object-center opacity-15"
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">How Change Happens</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-5">
            Our Theory of Change
          </h1>
          <p className="text-white/70 text-lg font-sans max-w-2xl mx-auto leading-relaxed">
            Equipping 100,000 Kingdom leaders is not a slogan — it&apos;s the outcome of a specific,
            testable logic model. Here is exactly how we believe formation turns into lasting impact,
            and how we intend to measure it.
          </p>
        </div>
      </section>

      {/* ── The Core Belief ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">The Core Belief</p>
          <h2 className="section-heading mb-5">Formed Leaders Change Everything Around Them</h2>
          <p className="text-slate font-sans text-base leading-relaxed">
            We do not believe the Church has an information problem. We believe it has a formation
            problem. Our theory of change rests on a simple chain: when a leader is genuinely formed —
            spiritually, emotionally, relationally — that formation does not stay contained. It
            reshapes their family, their church, their business, and everyone they disciple after them.
            Groundwork exists to interrupt the pattern of sending leaders before forming them.
          </p>
        </div>
      </section>

      {/* ── Logic Model Flow ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">The Logic Model</p>
            <h2 className="section-heading">Inputs &rarr; Activities &rarr; Outputs &rarr; Outcomes &rarr; Impact</h2>
            <p className="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto">
              Each stage builds on the one before it. This is the same chain we use internally
              to evaluate whether the program is actually working.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {stages.map((stage, i) => (
              <div key={stage.label} className="relative flex flex-col">
                <div className={`${stage.color} rounded-t-xl px-4 py-4 text-center`}>
                  <p className={`${stage.text} text-[11px] font-semibold tracking-widest uppercase font-sans`}>
                    Stage {i + 1}
                  </p>
                  <h3 className="font-serif text-lg text-white font-semibold mt-0.5">{stage.label}</h3>
                  <p className="text-white/55 text-xs font-sans mt-0.5">{stage.sub}</p>
                </div>
                <div className="bg-white rounded-b-xl border border-t-0 border-gray-100 shadow-sm px-4 py-4 flex-1">
                  <ul className="space-y-2.5">
                    {stage.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate font-sans leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper shrink-0 mt-1" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < stages.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10 text-copper text-xl font-bold">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assumptions ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Why We Believe This Works</p>
            <h2 className="section-heading">The Assumptions Behind the Model</h2>
            <p className="mt-3 text-slate font-sans text-sm max-w-2xl mx-auto">
              Every theory of change rests on assumptions. Here are ours, stated plainly so they
              can be examined and tested.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {assumptions.map(({ title, body }) => (
              <div key={title} className="card">
                <h3 className="font-serif text-lg text-navy font-semibold mb-2">{title}</h3>
                <p className="text-sm text-slate font-sans leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Measuring Success ── */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="section-label text-spring mb-3">Accountability</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">How We&apos;ll Measure Success</h2>
            <p className="mt-3 text-white/60 font-sans text-sm max-w-2xl mx-auto">
              As our first cohort launches in Spring 2027, we are building measurement into the
              program from day one — not adding it after the fact.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📊",
                title: "Pre/post assessments",
                body: "Every participant is assessed across all 6 formation pillars at intake and again at graduation to measure real change, not self-reported satisfaction.",
              },
              {
                icon: "📋",
                title: "Cohort completion & placement data",
                body: "We track completion rates, local service hours, and where graduates land — in ministry, marketplace, or missions — as concrete evidence of activation.",
              },
              {
                icon: "🤝",
                title: "Alumni tracking",
                body: "Graduates are surveyed at 6 and 12 months post-cohort to measure whether formation held and multiplied into their own communities.",
              },
              {
                icon: "💰",
                title: "Financial transparency",
                body: "Program allocation and outcomes are reported to our board and partners annually, tying dollars invested to leaders formed.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-serif text-base text-white font-semibold mb-1.5">{title}</p>
                <p className="text-white/60 text-xs font-sans leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-3">Join the Model</p>
          <h2 className="section-heading mb-4">Invest in the Chain, Not Just the Cohort</h2>
          <p className="text-slate font-sans text-sm leading-relaxed mb-8">
            Every partner who funds Groundwork is funding the entire chain — from formation
            to activation to multiplication. See how your investment maps to the model.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/partnership" className="btn-copper">
              Partner With Us
            </Link>
            <Link href="/cohort" className="btn-secondary">
              See the Cohort Journey
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
