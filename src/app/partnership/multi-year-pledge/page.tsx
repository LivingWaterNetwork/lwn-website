import type { Metadata } from "next";
import { InquiryForm, type InquiryField } from "@/components/sections/InquiryForm";

// Forced dynamic defensively — a sibling intake page in this same commit
// (src/app/programs/counseling/page.tsx) hit a static-generation build
// timeout on Vercel. See that file's comment for the full explanation.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discuss a Multi-Year Pledge",
  description: "Multi-year pledges let Living Water Network plan with confidence — hire staff, build curriculum, and launch new cohorts with certainty.",
};

const fields: InquiryField[] = [
  {
    type: "select",
    id: "pledgeLength",
    label: "How many years are you considering?",
    required: true,
    placeholder: "Select a pledge length",
    options: [
      { value: "3 years", label: "3 years" },
      { value: "4 years", label: "4 years" },
      { value: "5 years", label: "5 years" },
    ],
  },
  {
    type: "text",
    id: "estimatedAnnual",
    label: "Estimated annual commitment",
    placeholder: "e.g. $10,000/yr, or \"let's discuss\"",
  },
  {
    type: "textarea",
    id: "message",
    label: "Anything you'd like us to know before we talk",
    placeholder: "What matters most to you about a long-term commitment like this?",
    rows: 5,
  },
];

export default function MultiYearPledgePage() {
  return (
    <>
      <section className="py-24 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">A Legacy Commitment</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Build Something That Lasts
          </h1>
          <p className="text-white/65 font-sans text-lg leading-relaxed max-w-2xl mx-auto">
            Very few people ever commit to something beyond a single budget cycle. When you pledge multiple
            years to Living Water Network, you&apos;re not just funding a program — you&apos;re giving us the
            one thing every founder needs most and can never buy: the confidence to plan for the long term.
            We take that seriously, and we want to honor it well.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { phase: "Year 1 (2026–2027)", goal: "$145,000", focus: "Launch the inaugural cohort, fund founding staff leadership" },
              { phase: "Year 2 (2027–2028)", goal: "$190,000", focus: "Scale to two cohorts, expand the missions program" },
              { phase: "Year 3–5 (2028–2031)", goal: "$275,000+/yr", focus: "Full operational capacity, national reach" },
            ].map(({ phase, goal, focus }) => (
              <div key={phase} className="bg-mist rounded-xl p-5 text-left">
                <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-copper mb-2">{phase}</p>
                <p className="font-serif text-2xl font-semibold text-navy mb-2">{goal}</p>
                <p className="text-slate/70 text-xs font-sans leading-relaxed">{focus}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate text-sm font-sans mt-6">
            A multi-year pledge at any of our partnership tiers helps carry this roadmap forward — with
            elevated recognition and access for the length of your commitment.
          </p>
        </div>
      </section>

      <section className="py-16 bg-mist">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-label mb-2">Let&apos;s Discuss Your Pledge</p>
            <h2 className="section-heading">We&apos;d Be Honored</h2>
          </div>
          <InquiryForm
            endpoint="/api/partnership/pledge"
            thankYouHref="/partnership/thank-you?type=pledge"
            fields={fields}
            submitLabel="Discuss This Pledge"
          />
        </div>
      </section>
    </>
  );
}
