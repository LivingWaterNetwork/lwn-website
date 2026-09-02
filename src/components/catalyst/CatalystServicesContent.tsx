import Link from "next/link";
import {
  CATALYST_CAPABILITIES,
  CATALYST_PRINCIPLE,
  CATALYST_PROCESS,
  CATALYST_RELATIONSHIP_LINE,
} from "@/lib/catalystContent";

export function CatalystServicesContent() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <p className="cat-eyebrow cat-eyebrow-dark">Living Water Catalyst</p>
          <h1 className="cat-h1 text-white mt-5 max-w-3xl">What we do.</h1>
          <p className="cat-lede text-white/75 mt-7 max-w-2xl">
            Four capability areas that usually work together. Most engagements start with
            strategy and end with something running in production.
          </p>
          <div className="mt-10">
            <Link href="/catalyst/start" className="btn-copper">
              Request a Discovery Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Capability areas */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="space-y-16 md:space-y-20">
            {CATALYST_CAPABILITIES.map((capability, i) => (
              <div key={capability.id} id={capability.id} className="grid lg:grid-cols-12 gap-8 lg:gap-16 pt-8 cat-rule scroll-mt-24">
                <div className="lg:col-span-5">
                  <span className="cat-index">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="cat-h2 text-navy mt-3">{capability.title}</h2>
                  <p className="cat-body mt-5">{capability.summary}</p>
                </div>
                <div className="lg:col-span-7">
                  <h3 className="cat-meta-term">What this includes</h3>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3">
                    {capability.includes.map((item) => (
                      <li key={item} className="cat-body text-[15px] flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[0.65em] h-px w-3 bg-[#0A77BC] shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      href="/catalyst/start"
                      className="font-sans text-sm font-semibold text-[#0A77BC] transition-colors hover:text-deep-sea rounded-sm"
                    >
                      Discuss Your Project
                      <span aria-hidden="true"> &rarr;</span>
                      <span className="sr-only"> — {capability.title}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="relative overflow-hidden bg-deep-sea text-white">
        <div aria-hidden="true" className="absolute inset-0 cat-grid-bg opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="cat-eyebrow cat-eyebrow-dark">How We Work</p>
            <h2 className="cat-h2 text-white mt-5">Four stages, in order.</h2>
          </div>

          <ol className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/12 border border-white/12 rounded-lg overflow-hidden">
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

          <blockquote className="mt-12 max-w-2xl border-l-2 border-copper pl-6">
            <p className="font-serif text-xl md:text-2xl text-white leading-snug">
              {CATALYST_PRINCIPLE}
            </p>
          </blockquote>
        </div>
      </section>

      {/* Engagement note — no pricing, and an explicit separation from LWN giving */}
      <section className="bg-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="cat-eyebrow">Working Together</p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="cat-h2 text-navy">Every engagement starts with a conversation.</h2>
              <p className="cat-body mt-5">
                Scope, timeline, and cost depend entirely on what the organization actually needs,
                so we don&apos;t publish packages. The first step is a discovery conversation:
                what you&apos;re building, where it&apos;s stuck, and whether we&apos;re the right
                people to help. If we&apos;re not, we&apos;ll say so.
              </p>
              <p className="cat-body mt-5 text-slate/80">{CATALYST_RELATIONSHIP_LINE}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/catalyst/start" className="btn-copper">
                  Request a Discovery Conversation
                </Link>
                <Link href="/catalyst/work" className="btn-secondary">
                  See Our Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
