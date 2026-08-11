import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// Structurally identical to the sibling program pages, which hit a
// static-generation build timeout on Vercel — force-dynamic defensively
// for the same reason (see CLAUDE_HANDOFF.txt Section 7).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Church Advisory Services",
  description:
    "LWN Church Advisory Services works directly with church staff and leadership teams on volunteer recruitment and engagement, young adult ministry, small group leadership development, and overall ministry strategy.",
  openGraph: {
    title: "Church Advisory Services | Living Water Network",
    description:
      "Strategy and systems consulting for churches — volunteer engagement, young adult ministry, group leadership development, and ministry strategy.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Church Advisory Services | Living Water Network",
    description:
      "Strategy and systems consulting for churches — volunteer engagement, young adult ministry, group leadership development, and ministry strategy.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

const practiceAreas = [
  {
    icon: "🤝",
    title: "Volunteer Recruitment & Engagement",
    desc: "Building an actual pipeline — recruitment, onboarding, and retention systems — instead of relying on the same fraction of the congregation to fill every slot. Barna's research on volunteering found that a personal, direct invitation is still the single most effective way to recruit — more than four in ten volunteers say a direct ask is what actually moved them to serve. Most churches never build a system around that fact.",
  },
  {
    icon: "🌱",
    title: "Young Adult Ministry",
    desc: "Strategy for reaching and keeping the generation that's re-engaging with church right now. Barna's tracking shows Gen Z and Millennials volunteering at higher rates than Gen X — the appetite to serve is there. The work is building a young adult ministry that gives that willingness somewhere to land once they walk through the door.",
  },
  {
    icon: "👥",
    title: "Small Group Leadership Development",
    desc: "Training and developing the leaders your group ministry actually depends on. Barna has found a wide gap between churchgoers who are in a small group and those who aren't when it comes to experiencing real, meaningful community — and Lifeway Research's discipleship-score studies show churchgoers in a group consistently score higher on markers of spiritual growth than those who only attend a service. Groups aren't a program add-on; they're where formation happens.",
  },
  {
    icon: "🧭",
    title: "Ministry Strategy",
    desc: "Organizational and staffing strategy for the season your church is actually in — not a generic growth playbook borrowed from a church three times your size.",
  },
];

const stats = [
  {
    figure: "42%+",
    label: "of volunteers say a direct, personal invitation is what led them to serve",
    source: "Barna Group",
  },
  {
    figure: "Gen Z & Millennials",
    label: "now volunteer at higher rates than Gen X — the generation showing up is younger than most churches plan for",
    source: "Barna Group",
  },
  {
    figure: "Small groups",
    label: "correlate with meaningfully higher discipleship scores than attendance alone, across every frequency band studied",
    source: "Lifeway Research",
  },
];

const steps = [
  { step: "01", title: "Discovery Call", desc: "A direct conversation with your leadership team about what's actually working, what isn't, and where the real bottleneck is." },
  { step: "02", title: "Assessment", desc: "A structured look at your current volunteer systems, young adult engagement, or group structure — whichever practice area brought you to us." },
  { step: "03", title: "Strategy Roadmap", desc: "A specific, sequenced plan built for your church's size, staffing, and season — not a template pulled off a shelf." },
  { step: "04", title: "Implementation Support", desc: "Ongoing support as your team actually puts the plan into practice, with check-ins built around your timeline." },
];

const fields: ProgramField[] = [
  {
    type: "text",
    id: "churchName",
    label: "Church or organization name",
    required: true,
    placeholder: "e.g. Grace Community Church",
  },
  {
    type: "text",
    id: "role",
    label: "Your role",
    required: true,
    placeholder: "e.g. Lead Pastor, Executive Pastor, Volunteer Coordinator",
  },
  {
    type: "select",
    id: "practiceArea",
    label: "What would you like advisory support with?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "volunteers", label: "Volunteer Recruitment & Engagement" },
      { value: "young-adults", label: "Young Adult Ministry" },
      { value: "groups", label: "Small Group Leadership Development" },
      { value: "strategy", label: "General Ministry Strategy" },
      { value: "not-sure", label: "Not sure yet — help us figure it out" },
    ],
  },
  {
    type: "textarea",
    id: "context",
    label: "Tell us about your church and what prompted this inquiry",
    required: true,
    placeholder: "Church size, current structure, and the specific challenge you're trying to solve.",
    rows: 6,
  },
];

export default function ChurchAdvisoryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-navy py-28 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/leadership-group-backstage.jpg"
            alt="Church leadership team"
            fill
            className="object-cover object-center opacity-15"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">For Church Leadership Teams</p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mb-5">
            Church Advisory Services
          </h1>
          <p className="text-white/70 text-lg font-sans max-w-xl mx-auto leading-relaxed">
            Your congregation is not short on willing hearts. Strategy and systems consulting
            for the church itself — volunteer engagement, young adult ministry, group
            leadership, and the operational strategy that holds all three together.
          </p>
          <div className="mt-9">
            <Link href="#inquire" className="btn-primary">
              Schedule a Discovery Call
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem statement ── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">The Honest Problem</p>
          <h2 className="section-heading mb-6">Most Churches Run on Whoever Showed Up First</h2>
          <p className="text-slate font-sans text-base leading-relaxed">
            Volunteer slots get filled by whoever said yes last time. Young adults visit once and
            never come back, and no one&apos;s quite sure why. Small group leaders burn out because
            nobody built a pipeline to replace them. None of this is a spiritual problem — it&apos;s
            a systems problem, and systems are fixable. The research backs up what pastors already
            feel in their gut: the willingness in your congregation is almost never the missing
            ingredient. What&apos;s missing is a way to see it, ask for it, and shepherd it well.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label text-spring mb-3">What the Research Shows</p>
            <h2 className="font-serif text-3xl font-semibold">
              This Isn&apos;t Just Our Experience — It&apos;s the Data
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {stats.map(({ figure, label, source }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-3xl md:text-4xl font-semibold text-spring mb-3">
                  {figure}
                </p>
                <p className="text-white/75 text-sm font-sans leading-relaxed mb-2">{label}</p>
                <p className="text-white/45 text-xs font-sans uppercase tracking-wide">{source}</p>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs font-sans text-center mt-10 max-w-2xl mx-auto">
            Sources: Barna Group volunteer engagement research; Lifeway Research small-group
            discipleship studies. Figures cited reflect the most recent published findings from
            each organization at the time of writing.
          </p>
        </div>
      </section>

      {/* ── Differentiator ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="section-label mb-3">Why This Is Different</p>
          <h2 className="section-heading mb-6">Advisory Built From the Work, Not a Framework</h2>
          <p className="text-slate font-sans text-base leading-relaxed">
            This isn&apos;t a generic church-growth playbook, and it isn&apos;t data for data&apos;s
            sake. It&apos;s built from Omar Fandino&apos;s own years leading volunteer recruitment
            and engagement, young adult ministry, and small groups — shaped further by what Barna
            and Lifeway&apos;s research consistently confirms about why people serve, stay, and
            grow. The goal is the same either way: a church where the people already there are
            seen, asked, and given somewhere to grow.
          </p>
          <blockquote className="mt-8 font-serif text-xl md:text-2xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left max-w-xl mx-auto">
            &ldquo;Every church I&apos;ve worked with already has the people it needs. What&apos;s
            usually missing isn&apos;t willingness — it&apos;s a system that actually asks them,
            trains them, and gives them somewhere to grow.&rdquo;
            <cite className="block mt-3 text-sm not-italic text-slate/60 font-sans">
              — Omar J. Fandino, Founder of Living Water Network
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ── Practice Areas ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">What We Help With</p>
            <h2 className="section-heading">Four Practice Areas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {practiceAreas.map(({ icon, title, desc }) => (
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
            <h2 className="section-heading">From Discovery Call to Implementation</h2>
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
            <Link href="#inquire" className="btn-primary">
              Schedule a Discovery Call
            </Link>
          </div>
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 h-40 md:h-52">
        {[
          { src: "/images/team-elevator-selfie.jpg", alt: "Church leadership team fellowship" },
          { src: "/images/omar-community-event.jpg", alt: "Omar Fandino at a community event" },
          { src: "/images/cohort-group-activity.jpg", alt: "Leaders working together" },
          { src: "/images/leadership-group-backstage.jpg", alt: "Leadership team meeting" },
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
            <h2 className="section-heading mb-4">Schedule a Discovery Call</h2>
            <p className="text-slate leading-relaxed text-sm font-sans mb-4">
              Fill out the form and Omar will personally follow up to schedule a discovery call
              with your leadership team.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Not sure which practice area fits? Say so in the form — figuring that out together
              is part of the discovery call itself.
            </p>
          </div>

          <ProgramInquiryForm
            program="church-advisory"
            fields={fields}
            submitLabel="Request a Discovery Call"
            successTitle="Thank You"
            successBody="Omar will personally review your inquiry and follow up to schedule your discovery call."
          />
        </div>
      </section>
    </>
  );
}
