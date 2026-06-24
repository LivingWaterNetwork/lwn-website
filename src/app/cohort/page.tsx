import type { Metadata } from "next";
import { CohortForm } from "@/components/sections/CohortForm";

export const metadata: Metadata = {
  title: "Cohort Application",
  description:
    "Apply for the Living Water Network cohort — a transformative journey in spiritual formation, discipleship, and leadership development.",
};

export default function CohortPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Join the Network</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">Cohort Application</h1>
          <p className="mt-4 text-white/65 text-lg font-sans">
            An immersive experience in spiritual formation, discipleship, and Kingdom
            leadership — with others just like you.
          </p>
        </div>
      </section>

      {/* Cohort details */}
      <section className="py-16 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {[
            { label: "Dates", value: "[PLACEHOLDER — cohort dates coming soon]", icon: "📅" },
            { label: "Location", value: "[PLACEHOLDER — location / format coming soon]", icon: "📍" },
            { label: "Investment", value: "[PLACEHOLDER — cost details coming soon]", icon: "💰" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <p className="section-label mb-1">{label}</p>
              <p className="text-sm text-slate font-sans">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What to expect */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading mb-6 text-center">What to Expect</h2>
          <div className="space-y-4 text-slate leading-relaxed text-sm font-sans">
            <p>
              The Living Water Network cohort is not a conference or a weekend seminar.
              It&apos;s an immersive, multi-week journey designed to go deep — into Scripture,
              into community, and into the hidden places of your leadership that most
              development programs never touch.
            </p>
            <p>
              You will be challenged, held accountable, and profoundly encouraged by
              fellow leaders who are navigating the same tensions between calling and
              capacity, between ambition and surrender.
            </p>
            <p>
              Participants leave restored, equipped, and inspired — ready to return to
              their communities and spark meaningful Kingdom change.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Spiritual formation sessions",
              "Peer community and accountability",
              "One-on-one pastoral care",
              "Leadership development curriculum",
              "Prayer and worship experiences",
              "Post-cohort mentorship access",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate font-sans">
                <svg className="w-5 h-5 text-copper shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="py-16 bg-mist">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center mb-2">Apply Now</h2>
          <p className="text-center text-slate text-sm mb-10 font-sans">
            Fill out the form below and we&apos;ll be in touch within a few business days.
          </p>
          <CohortForm />
        </div>
      </section>
    </>
  );
}
