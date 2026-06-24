import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="bg-mist py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join CTA */}
        <div className="rounded-2xl bg-navy px-8 py-10 flex flex-col gap-4">
          <h3 className="font-serif text-2xl font-semibold text-white">
            Ready to be a river?
          </h3>
          <p className="text-white/65 text-sm leading-relaxed font-sans">
            Applications for the next cohort are open. Take the first step toward
            restored, equipped leadership.
          </p>
          <Link href="/cohort" className="btn-copper self-start">
            Join the Network
          </Link>
        </div>

        {/* Donate CTA */}
        <div className="rounded-2xl bg-white border border-mist px-8 py-10 flex flex-col gap-4">
          <h3 className="font-serif text-2xl font-semibold text-navy">
            Support the Movement
          </h3>
          <p className="text-slate text-sm leading-relaxed font-sans">
            Your generosity ignites transformation. Help us launch the first cohort
            and impact Kingdom leaders across the globe.
          </p>
          <Link href="/donate" className="btn-primary self-start">
            Give Today
          </Link>
        </div>
      </div>
    </section>
  );
}
