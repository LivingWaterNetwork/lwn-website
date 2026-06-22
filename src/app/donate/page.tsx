import type { Metadata } from "next";
import { DonateForm } from "@/components/sections/DonateForm";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Living Water Network. Your generosity ignites transformation. Join the Circle and help launch the first cohort.",
};

export default function DonatePage() {
  return (
    <>
      {/* Header */}
      <section className="bg-teal py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Support the Mission
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Your Generosity Ignites Transformation
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Join the Circle — funding the launch of the first Living Water Network cohort
            and the leaders it will release into the world.
          </p>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { stat: "100,000", label: "Kingdom leaders we aim to impact" },
            { stat: "5 yrs", label: "Timeline for our mission" },
            { stat: "501(c)(3)", label: "All donations are tax-deductible" },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <p className="font-serif text-3xl font-bold text-teal">{stat}</p>
              <p className="text-sm text-charcoal/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Donation form */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonateForm />
          <p className="mt-6 text-center text-xs text-charcoal/50 leading-relaxed">
            Living Water Network Inc. is a 501(c)(3) nonprofit organization. All
            donations are tax-deductible to the extent allowed by law. You will
            receive an email receipt after your gift is processed.
          </p>
        </div>
      </section>
    </>
  );
}
