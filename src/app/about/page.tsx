import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Living Water Network, our founder, our story, and why we exist to equip Kingdom leaders.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── Page header ── */}
      <section className="bg-teal py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Our Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            About Living Water Network
          </h1>
        </div>
      </section>

      {/* ── Founder story ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Photo placeholder */}
          <div className="rounded-2xl bg-stone-100 aspect-square flex items-center justify-center text-charcoal/30 text-sm">
            {/* PLACEHOLDER: replace with <Image src="/images/founder.jpg" ... /> */}
            Founder photo coming soon
          </div>

          <div>
            <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
              Our Founder
            </p>
            <h2 className="section-heading mb-4">
              {/* PLACEHOLDER: Founder name */}
              [Founder Name]
            </h2>
            {/* PLACEHOLDER: Replace with Omar's bio once provided */}
            <div className="space-y-4 text-charcoal/75 leading-relaxed text-sm">
              <p>
                [Founder bio placeholder — Omar to provide full biographical content
                describing his journey, calling, and the vision behind Living Water Network.]
              </p>
              <p>
                [Include: ministry background, what led to founding LWN, key turning
                points, and the heart behind the 100,000-leader mission.]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dallas Willard quote ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-6">
            Our Philosophy
          </p>
          {/*
            PLACEHOLDER: Replace this block with the exact Dallas Willard quote.
            The quote is visible as an image on the Wix site — Omar to provide the
            verbatim text so it renders accessibly here.
          */}
          <blockquote className="font-serif text-2xl md:text-3xl italic text-teal leading-relaxed border-l-4 border-gold pl-6 text-left">
            &ldquo;[Dallas Willard quote — Omar to provide exact text]&rdquo;
          </blockquote>
          <p className="mt-4 text-charcoal/60 text-sm font-semibold">
            — Dallas Willard
          </p>
        </div>
      </section>

      {/* ── Why we exist ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-3">
            Why We Exist
          </p>
          <h2 className="section-heading mb-6">
            A Movement Born from Conviction
          </h2>
          <div className="space-y-4 text-charcoal/75 leading-relaxed">
            <p>
              At Living Water Network, our mission is to impact 100,000 Kingdom leaders
              over the next five years by providing transformative spiritual formation,
              intentional discipleship, and leadership development for those serving in
              both ministry and the marketplace.
            </p>
            <p>
              We serve a diverse range of leaders — from emerging pastors to high-level
              church volunteers, lay leaders, and marketplace influencers — anyone called
              to lead with purpose and integrity.
            </p>
          </div>
        </div>
      </section>

      {/* ── 501(c)(3) statement ── */}
      <section className="py-10 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-teal/5 border border-teal/20 px-6 py-5 flex gap-4 items-start">
            <div className="text-teal mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              <strong className="text-charcoal">Living Water Network Inc.</strong> is a
              registered 501(c)(3) nonprofit organization. All donations are
              tax-deductible to the extent allowed by law.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-teal text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold mb-4">
            Join the Movement
          </h2>
          <p className="text-white/75 mb-8">
            Ready to be equipped, restored, and sent out to lead with Kingdom purpose?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cohort" className="btn-gold">
              Apply for a Cohort
            </Link>
            <Link href="/donate" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white/50 text-white font-semibold text-sm transition-colors hover:border-white hover:bg-white/10">
              Support the Mission
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
