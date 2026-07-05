import type { Metadata } from "next";
import Image from "next/image";
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
      <section className="relative bg-navy py-20 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/omar-speaking-main-stage.jpg"
            alt="Omar speaking at a leadership event"
            fill
            className="object-cover object-center opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Our Story</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            About Living Water Network
          </h1>
        </div>
      </section>

      {/* ── Founder story ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Founder photo */}
          <div className="rounded-2xl overflow-hidden aspect-[3/4] relative shadow-lg">
            <Image
              src="/images/omar-headshot-pro.jpg"
              alt="Omar Fandino, Founder of Living Water Network"
              fill
              className="object-cover object-top"
            />
          </div>

          <div>
            <p className="section-label mb-3">Our Founder</p>
            <h2 className="section-heading mb-1">Omar Fandino</h2>
            <p className="text-xs text-slate/60 font-sans mb-4 uppercase tracking-wide">Founder, Living Water Network</p>
            <div className="space-y-4 text-slate leading-relaxed text-sm font-sans">
              <p>
                Omar Fandino was born in Colombia and raised in New York by a single mother who
                gave him everything she had. His father was absent. The streets were not. By his
                early years he was already making the wrong choices for the right-seeming reasons,
                and those choices eventually led him to prison.
              </p>
              <p>
                It was there, stripped of performance and pretense, that Jesus found him. What
                happened next is what Living Water Network exists to replicate. Omar did not simply
                convert; he was <em>formed</em>. Scripture became breath. The Holy Spirit became
                teacher. And as Omar began to grow, he could not keep it to himself. He started
                gathering men, talking about Jesus, studying together, praying. What began as a
                small group inside a correctional facility grew into a congregation of over 100 men
                meeting weekly, being discipled, counseled, and walked through the deep work of
                becoming someone new.
              </p>
              <p>
                Released in 2021 and back in Atlanta, Omar joined Victory Church. He started as an
                administrative assistant, choosing to serve with his hands before leading with his
                voice. That humility opened doors, and he grew into a Guest Experience Coordinator
                role before his work expanded into the broader leadership arena. Through consulting
                engagements with Rizewell and Grow Stack Drive, he delivered executive leadership
                development, designed organizational strategy, and demonstrated that formation and
                strategic execution are not opposites; they are inseparable.
              </p>
              <p>
                During those years, Omar was shaped by the writings of Dallas Willard, Pete
                Scazzero, John Mark Comer, Dave Ferguson, William Gurnall, and Augustine, thinkers
                who taught him that the goal of the Christian life is not greater performance but
                deeper formation. That conviction became the foundation of Living Water Network,
                which he founded in 2023.
              </p>
              <p>
                Today, Omar is pursuing a Bachelor&apos;s degree in Leadership Development and
                Nonprofit Management at Liberty University, is an active member of his local
                church, and is building LWN into a movement grounded in one conviction: leaders
                cannot sustainably take others where they have not gone themselves.
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/ofandino/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-xs font-semibold font-sans text-[#0A77BC] hover:underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── Dallas Willard quote ── */}
      <section className="py-20 bg-mist">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="section-label mb-6">Our Philosophy</p>
          <blockquote className="font-serif text-2xl md:text-3xl italic text-navy leading-relaxed border-l-4 border-copper pl-6 text-left">
            &ldquo;Discipleship is the process of becoming who Jesus would be if he were you.&rdquo;
          </blockquote>
          <p className="mt-4 text-slate text-sm font-semibold font-sans">
            — Dallas Willard
          </p>
        </div>
      </section>

      {/* ── Why we exist ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-3">Why We Exist</p>
          <h2 className="section-heading mb-6">A Movement Born from Conviction</h2>
          <div className="space-y-4 text-slate leading-relaxed font-sans">
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

      {/* ── Ministry in action photo grid ── */}
      <section className="py-16 bg-mist">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-3 text-center">Ministry in Action</p>
          <h2 className="section-heading mb-10 text-center">Equipping Leaders Everywhere</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/prayer-ministry.jpg" alt="Leaders praying together" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/omar-community-event.jpg" alt="Omar at a community event" fill className="object-cover object-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/baptism-red-shirt.jpg" alt="Baptism ministry" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/men-neighborhood-prayer.jpg" alt="Men's ministry gathering" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/omar-with-partner.jpg" alt="Omar with ministry partner" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src="/images/leadership-group-backstage.jpg" alt="Leadership community" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 501(c)(3) statement ── */}
      <section className="py-10 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-[#0A77BC]/5 border border-[#0A77BC]/20 px-6 py-5 flex gap-4 items-start">
            <div className="text-[#0A77BC] mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-slate leading-relaxed font-sans">
              <strong className="text-navy">Living Water Network Inc.</strong> is a
              registered 501(c)(3) nonprofit organization. All donations are
              tax-deductible to the extent allowed by law.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold mb-2">Ready to lead?</h2>
          <p className="font-serif italic text-spring text-xl mb-4">Rooted in truth. Sent to lead.</p>
          <p className="text-white/65 mb-8 font-sans">
            Ready to be equipped, restored, and sent out to lead with Kingdom purpose?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cohort" className="btn-copper">Join the Network</Link>
            <Link href="/donate" className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-white/40 text-white font-semibold font-sans text-sm transition-colors hover:border-white hover:bg-white/10">
              Support the Mission
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
