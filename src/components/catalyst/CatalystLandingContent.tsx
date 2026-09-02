import Link from "next/link";
import type { CatalystProjectMeta } from "@/lib/catalystTypes";
import {
  CATALYST_AUDIENCES,
  CATALYST_CAPABILITIES,
  CATALYST_OS_LAYERS,
  CATALYST_PRINCIPLE,
  CATALYST_PROCESS,
  CATALYST_RELATIONSHIP_LINE,
} from "@/lib/catalystContent";
import { CatalystProjectCard } from "./CatalystProjectCard";

export function CatalystLandingContent({ projects }: { projects: CatalystProjectMeta[] }) {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy to-transparent"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <p className="cat-eyebrow cat-eyebrow-dark">Living Water Catalyst</p>
              <h1 className="cat-h1 text-white mt-5 max-w-3xl">Build what your mission requires.</h1>
              <p className="cat-lede text-white/75 mt-7 max-w-2xl">
                We help mission-driven organizations turn vision into strategy, digital
                experiences, working systems, and the infrastructure to carry them.
              </p>
              <p className="cat-body text-white/60 mt-5 max-w-2xl">
                Strategy, systems, technology, and responsible AI—designed around the
                organization, not the other way around.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/catalyst/work" className="btn-copper">
                  Explore Our Work
                </Link>
                <Link
                  href="/catalyst/start"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/30 text-white font-semibold font-sans text-sm tracking-wide transition hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Start a Conversation
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-px bg-white/12 border border-white/12 rounded-lg overflow-hidden">
                {["Strategy", "Systems", "Technology", "Growth"].map((word) => (
                  <li
                    key={word}
                    className="bg-navy px-5 py-4 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-white/80"
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Brand introduction ───────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="cat-eyebrow">What Catalyst Means</p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="cat-h2 text-navy">
                A catalyst helps meaningful change actually move forward.
              </h2>
              <p className="cat-lede mt-6">
                That is the whole idea behind the name. Catalyst brings strategy, systems,
                technology, and execution together in one place, so an organization can grow
                without losing its mission, its identity, or its people along the way.
              </p>
              <p className="cat-body mt-5">
                Most organizations don&apos;t need more ideas. They need the structure to carry
                the ideas they already have — and someone who will stay with the work from the
                first conversation through to the thing being live.
              </p>
              <p className="cat-body mt-5 text-slate/80">{CATALYST_RELATIONSHIP_LINE}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. The problem ──────────────────────────────────────────────── */}
      <section className="bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="cat-eyebrow">The Gap</p>
            <h2 className="cat-h2 text-navy mt-5">
              Strong conviction, no structure to carry it.
            </h2>
            <p className="cat-lede mt-6">
              Visionary leaders usually have the hard part covered. They have strong ideas, real
              impact, programs that work, and deep convictions about why the work matters.
            </p>
            <p className="cat-body mt-5">What they often don&apos;t have is everything underneath it.</p>
          </div>

          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-navy/10 border border-navy/10 rounded-lg overflow-hidden">
            {[
              "Organizational architecture",
              "Digital infrastructure",
              "Documented systems",
              "Technical execution",
              "Responsible automation",
              "A realistic path from vision to implementation",
            ].map((item) => (
              <li key={item} className="bg-mist px-6 py-7">
                <span className="cat-body text-navy font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <p className="cat-lede mt-12 max-w-2xl text-navy">Catalyst exists to close that gap.</p>
        </div>
      </section>

      {/* ── 4. What we build ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="cat-eyebrow">What We Build</p>
            <h2 className="cat-h2 text-navy mt-5">Four areas, one continuous piece of work.</h2>
            <p className="cat-body mt-5">
              These aren&apos;t separate offerings so much as four parts of the same job. Most
              engagements touch more than one.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-x-12 gap-y-12">
            {CATALYST_CAPABILITIES.map((capability, i) => (
              <div key={capability.id} className="pt-6 cat-rule">
                <span className="cat-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="cat-h3 text-navy mt-3">{capability.title}</h3>
                <p className="cat-body mt-3">{capability.summary}</p>
                <ul className="mt-5 space-y-2">
                  {capability.includes.map((item) => (
                    <li key={item} className="cat-body text-[15px] flex gap-3">
                      <span aria-hidden="true" className="text-[#0A77BC] mt-[0.45em] h-px w-3 bg-[#0A77BC] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link href="/catalyst/services" className="btn-secondary">
              See how we work with organizations
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. How we work ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-deep-sea text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="cat-eyebrow cat-eyebrow-dark">How We Work</p>
            <h2 className="cat-h2 text-white mt-5">Four stages, in order.</h2>
          </div>

          <ol className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/12 border border-white/12 rounded-lg overflow-hidden">
            {CATALYST_PROCESS.map((stage) => (
              <li key={stage.index} className="bg-deep-sea px-6 py-8">
                <span className="font-serif text-sm font-semibold text-spring tabular-nums">
                  {stage.index}
                </span>
                <h3 className="cat-h3 text-white mt-3">{stage.title}</h3>
                <p className="cat-body text-white/70 mt-3 text-[15px]">{stage.summary}</p>
              </li>
            ))}
          </ol>

          <blockquote className="mt-14 max-w-2xl border-l-2 border-copper pl-6">
            <p className="font-serif text-xl md:text-2xl text-white leading-snug">
              {CATALYST_PRINCIPLE}
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── 6. Selected work ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="cat-eyebrow">Selected Work</p>
              <h2 className="cat-h2 text-navy mt-5">What&apos;s been built so far.</h2>
              <p className="cat-body mt-5">
                Every project below carries its actual status. Work in progress is labeled as
                work in progress.
              </p>
            </div>
            <Link
              href="/catalyst/work"
              className="font-sans text-sm font-semibold text-[#0A77BC] transition-colors hover:text-deep-sea rounded-sm shrink-0"
            >
              All work<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <CatalystProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="cat-empty mt-12">
              <p className="cat-body text-navy">Published work will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Organizational operating system ──────────────────────────── */}
      <section className="bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="cat-eyebrow">Organizational Operating System</p>
              <h2 className="cat-h2 text-navy mt-5">
                A shared foundation instead of starting over each time.
              </h2>
              <p className="cat-body mt-5">
                The pattern we keep returning to is a three-layer architecture: a neutral core
                that stays the same, an organization layer that carries identity, and a
                deployment layer where the visible work ships.
              </p>
              <p className="cat-status cat-status-foundation-strategy mt-7">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                Foundation and architecture in progress.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ol className="grid gap-px bg-navy/10 border border-navy/10 rounded-lg overflow-hidden">
                {CATALYST_OS_LAYERS.map((layer, i) => (
                  <li key={layer.name} className="bg-mist px-6 py-7 md:px-8">
                    <div className="flex items-baseline gap-4">
                      <span className="cat-index">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="cat-h3 text-navy">{layer.name}</h3>
                    </div>
                    <p className="cat-body mt-3 md:pl-10">{layer.summary}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Who Catalyst serves ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="cat-eyebrow">Who Catalyst Serves</p>
            <h2 className="cat-h2 text-navy mt-5">Organizations carrying more than their systems can hold.</h2>
          </div>

          <dl className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9">
            {CATALYST_AUDIENCES.map((audience) => (
              <div key={audience.title} className="pt-5 cat-rule">
                <dt className="cat-h3 text-navy text-lg">{audience.title}</dt>
                <dd className="cat-body mt-2 text-[15px]">{audience.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 9. Relationship to Living Water Network ─────────────────────── */}
      <section className="bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="cat-eyebrow">Catalyst & Living Water Network</p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="cat-h2 text-navy">Two kinds of equipping.</h2>
              <p className="cat-lede mt-6">{CATALYST_RELATIONSHIP_LINE}</p>
              <p className="cat-body mt-5">
                Living Water Network equips leaders. Catalyst extends that equipping mission into
                practical infrastructure — the strategy, systems, and technology an organization
                needs to carry its work.
              </p>
              <p className="cat-body mt-5">
                Living Water Network itself stays centered where it has always been: spiritual
                formation, discipleship, leadership development, coaching, counseling,
                mentorship, cohorts, and church advisory.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/about" className="btn-secondary">
                  About Living Water Network
                </Link>
                <Link href="/programs" className="btn-secondary">
                  Explore LWN Programs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h2 className="cat-h2 text-white max-w-2xl mx-auto">Your vision deserves infrastructure.</h2>
          <p className="cat-body text-white/70 mt-6 max-w-xl mx-auto">
            Tell us what you&apos;re building and where it&apos;s getting stuck. We&apos;ll tell
            you honestly whether we&apos;re the right people to help.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalyst/start" className="btn-copper">
              Start a Conversation
            </Link>
            <Link
              href="/catalyst/work"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/30 text-white font-semibold font-sans text-sm tracking-wide transition hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spring focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
