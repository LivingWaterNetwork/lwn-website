import type { Metadata } from "next";
import Link from "next/link";
import { canonical, breadcrumbJsonLd } from "@/lib/seo";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanGroupSuggestForm } from "@/components/yan/sections/YanGroupSuggestForm";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { YanFaithAnchor } from "@/components/yan/sections/YanFaithAnchor";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const dynamic = "force-static";

const city = getYanCity("phoenix")!;
const otherCities = getOtherCities("phoenix");
const stats = getCityStats("phoenix", ["youngAdults", "faith", "loneliness"]);

export const metadata: Metadata = {
  ...canonical("/yan/phoenix"),
  title: "YAN Phoenix | Young Adults Network Phoenix",
  description:
    "YAN is coming to Phoenix and the Valley — connecting the young-adult ministries, groups, pastors, and leaders across metro Phoenix into one shared mission.",
  openGraph: {
    title: "YAN Phoenix | Young Adults Network Phoenix",
    description: "The YAN movement, taking root across Phoenix and the Valley. Help build the launch team.",
    type: "website",
  },
};

export default function YanPhoenixPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Phoenix", path: "/yan/phoenix" }])) }}
      />

      {/* Hero — no stock photo sourced for Phoenix yet, so this stays a navy gradient like /yan/join */}
      <section className="relative overflow-hidden bg-gradient-to-b from-yan-navy to-yan-navy/90">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-5">YAN Phoenix &middot; {city.stageBadge}</p>
            <h1 className="yan-h1 text-white mb-6 text-balance">{city.tagline}</h1>
            <p className="yan-body text-white/75 max-w-2xl mx-auto mb-10 text-lg">
              The same movement connecting young-adult ministries in Atlanta is taking its first
              steps across the Valley — and it starts with the leaders willing to help build it.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <Link href="/yan/join?path=ministry-leader&city=Phoenix" className="yan-btn-primary">
              Help Launch YAN Phoenix
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* Origin story / honest stage */}
      <section className="bg-white py-20 sm:py-28">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">Where This Started</p>
          <h2 className="yan-h2 text-yan-navy mb-6">Born in Atlanta. Built city by city.</h2>
          <p className="yan-body text-yan-navy/65 text-lg leading-relaxed mb-4">
            YAN began as a way to connect the young-adult ministries already at work across Atlanta —
            not to compete with churches, but to help what God was already doing find each other.
            That same simple idea is now finding its way to Phoenix and the surrounding Valley.
          </p>
          <p className="yan-body text-yan-navy/65 text-lg leading-relaxed">
            There&apos;s no directory or event calendar here yet — this hub is genuinely just
            beginning. If you lead a young-adult ministry, group, or church anywhere in metro Phoenix,
            you&apos;d be one of the first voices shaping what YAN Phoenix becomes.
          </p>
        </FadeInSection>
      </section>

      {/* Faith anchor — Scripture + a historic Christian voice, grounding the movement in Jesus before anything else */}
      <section className="bg-white pb-20 sm:pb-28">
        <div className="px-4 sm:px-6 lg:px-8">
          <YanFaithAnchor pageKey="national" />
        </div>
      </section>

      {/* Real context — cited stats grounding why this hub matters */}
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <p className="yan-eyebrow mb-3">The Real Picture</p>
            <h2 className="yan-h2 text-yan-navy mb-5">Why Phoenix, why now.</h2>
            <p className="yan-body text-yan-navy/60 max-w-2xl mx-auto">
              Metro Phoenix is one of the fastest-growing regions in the country — and its young
              adults are navigating real challenges alongside real spiritual momentum.
            </p>
          </FadeInSection>
          <YanStatsStrip stats={stats} />
        </div>
      </section>

      {/* Valley areas */}
      <section className="bg-yan-navy py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInSection className="text-center mb-14">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">A Valley, Waiting to Connect</p>
            <h2 className="yan-h2 text-white mb-5">From Downtown to Scottsdale.</h2>
            <p className="yan-body text-white/60 max-w-2xl mx-auto">
              Young-adult ministries are already at work across the Valley. YAN Phoenix exists to
              become the thread that connects them — as soon as the founding leaders are in place.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2">
              {["Downtown Phoenix", "Tempe", "Scottsdale", "Mesa", "Chandler", "Glendale"].map((n) => (
                <span key={n} className="yan-pill">
                  {n}
                </span>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Network preview — honest empty state */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <YanEmptyState
              eyebrow="The Network"
              title="YAN Phoenix doesn't exist yet — you could help start it."
              body="There's no directory, no events, no leader list here — not yet. The first ministries and leaders who join become the founding team for the entire Valley."
              ctaHref="/yan/join?path=ministry-leader&city=Phoenix"
              ctaLabel="Join the launch team"
            />
          </FadeInSection>
        </div>
      </section>

      {/* Suggest a group form, reused — captures early interest even before a directory exists */}
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <p className="text-center yan-eyebrow mb-3">Be First</p>
            <h2 className="text-center yan-h3 text-yan-navy mb-6">Tell us about your Phoenix ministry</h2>
            <YanGroupSuggestForm city="Phoenix" />
          </FadeInSection>
        </div>
      </section>

      {/* Cross-city callout */}
      <section className="bg-white py-16 sm:py-20 border-t border-yan-navy/5">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">One Movement, Many Cities</p>
          <h2 className="yan-h3 text-yan-navy mb-4">Phoenix isn&apos;t alone in this.</h2>
          <p className="text-yan-navy/60 font-yan-body mb-8 max-w-xl mx-auto">
            YAN Phoenix shares the same foundation as every other hub — starting with Atlanta, where
            the movement began, and New York and Los Angeles, launching alongside it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {otherCities.map((c) => (
              <Link key={c.slug} href={`/yan/${c.slug}`} className="yan-btn-ghost text-sm">
                See {c.name} &rarr;
              </Link>
            ))}
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
