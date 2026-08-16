import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { canonical, breadcrumbJsonLd } from "@/lib/seo";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanGroupSuggestForm } from "@/components/yan/sections/YanGroupSuggestForm";
import { getYanCity, getOtherCities } from "@/lib/yanCities";

export const dynamic = "force-static";

const city = getYanCity("los-angeles")!;
const otherCities = getOtherCities("los-angeles");

export const metadata: Metadata = {
  ...canonical("/yan/los-angeles"),
  title: "YAN Los Angeles | Young Adults Network LA",
  description:
    "YAN is coming to Los Angeles — connecting the young-adult ministries, groups, pastors, and leaders across LA into one shared mission.",
  openGraph: {
    title: "YAN Los Angeles | Young Adults Network LA",
    description: "The YAN movement, taking root in Los Angeles. Help build the launch team.",
    type: "website",
    images: [{ url: "/images/yan/source/la-downtown-skyline.jpg", width: 1200, height: 630, alt: "Downtown Los Angeles skyline" }],
  },
};

export default function YanLosAngelesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Los Angeles", path: "/yan/los-angeles" }])) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={city.heroImage} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-yan-navy via-yan-navy/85 to-yan-navy/50" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-5">YAN Los Angeles &middot; {city.stageBadge}</p>
            <h1 className="yan-h1 text-white mb-6 text-balance">{city.tagline}</h1>
            <p className="yan-body text-white/75 max-w-2xl mx-auto mb-10 text-lg">
              The same movement connecting young-adult ministries in Atlanta is taking its first
              steps in Los Angeles — and it starts with the leaders willing to help build it.
            </p>
            <Link href="/yan/join?path=ministry-leader&city=Los%20Angeles" className="yan-btn-primary">
              Help Launch YAN LA
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
            That same simple idea is now finding its way to Los Angeles.
          </p>
          <p className="yan-body text-yan-navy/65 text-lg leading-relaxed">
            There&apos;s no directory or event calendar here yet — this hub is genuinely just
            beginning. If you lead a young-adult ministry, group, or church anywhere across LA
            County, you&apos;d be one of the first voices shaping what YAN LA becomes.
          </p>
        </FadeInSection>
      </section>

      {/* LA imagery + neighborhoods */}
      <section className="bg-yan-navy py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInSection className="text-center mb-14">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">A City, Waiting to Connect</p>
            <h2 className="yan-h2 text-white mb-5">From Downtown to the Valley.</h2>
            <p className="yan-body text-white/60 max-w-2xl mx-auto">
              Young-adult ministries are already at work across every corner of LA County. YAN LA
              exists to become the thread that connects them — as soon as the founding leaders are
              in place.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
              <Image src="/images/yan/source/la-venice-beach-street.jpg" alt="A Los Angeles street scene near Venice Beach" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-yan-navy/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
                {["Downtown", "Silver Lake", "Koreatown", "Venice", "The Valley"].map((n) => (
                  <span key={n} className="yan-pill">
                    {n}
                  </span>
                ))}
              </div>
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
              title="YAN LA doesn't exist yet — you could help start it."
              body="There's no directory, no events, no leader list here — not yet. The first ministries and leaders who join become the founding team for the entire city."
              ctaHref="/yan/join?path=ministry-leader&city=Los%20Angeles"
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
            <h2 className="text-center yan-h3 text-yan-navy mb-6">Tell us about your LA ministry</h2>
            <YanGroupSuggestForm city="Los Angeles" />
          </FadeInSection>
        </div>
      </section>

      {/* Cross-city callout */}
      <section className="bg-white py-16 sm:py-20 border-t border-yan-navy/5">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">One Movement, Many Cities</p>
          <h2 className="yan-h3 text-yan-navy mb-4">LA isn&apos;t alone in this.</h2>
          <p className="text-yan-navy/60 font-yan-body mb-8 max-w-xl mx-auto">
            YAN LA shares the same foundation as every other hub — starting with Atlanta, where the
            movement began, and New York City, launching alongside LA.
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
