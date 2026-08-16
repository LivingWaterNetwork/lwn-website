import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { canonical, breadcrumbJsonLd } from "@/lib/seo";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { MovementGateway } from "@/components/yan/gateway/MovementGateway";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { getOtherCities } from "@/lib/yanCities";

export const dynamic = "force-dynamic";

const otherCities = getOtherCities("atlanta");

export const metadata: Metadata = {
  ...canonical("/yan/atlanta"),
  title: "YAN Atlanta | Young Adults Network Atlanta",
  description:
    "YAN Atlanta connects the young-adult ministries, groups, pastors, and leaders already serving metro Atlanta into one shared mission — the founding hub of the YAN network.",
  openGraph: {
    title: "YAN Atlanta | Young Adults Network Atlanta",
    description: "One City. Many Churches. One Mission. Where the YAN network began.",
    type: "website",
    images: [{ url: "/images/yan/source/atlanta-skyline-dusk.jpg", width: 1200, height: 630, alt: "Atlanta skyline at dusk" }],
  },
};

export default async function YanAtlantaPage() {
  const featuredEvent = await safeYanQuery(
    () => prisma.yanEvent.findFirst({ where: { status: { in: ["coming-soon", "published"] } }, orderBy: { startsAt: "asc" } }),
    null
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Atlanta", path: "/yan/atlanta" }])) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-skyline-dusk.jpg" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-yan-navy via-yan-navy/85 to-yan-navy/50" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-5">YAN Atlanta &middot; Founding Hub</p>
            <h1 className="yan-h1 text-white mb-6 text-balance">One City. Many Churches. One Mission.</h1>
            <p className="yan-body text-white/75 max-w-2xl mx-auto mb-10 text-lg">
              A movement connecting the young-adult ministries, groups, pastors, and leaders already
              serving Atlanta — where YAN began.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <MovementGateway />
          </FadeInSection>
        </div>
      </section>

      {/* Atlanta network story */}
      <section className="bg-yan-navy py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInSection className="text-center mb-14">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">A City, Connected</p>
            <h2 className="yan-h2 text-white mb-5">Atlanta&apos;s ministries, becoming one network.</h2>
            <p className="yan-body text-white/60 max-w-2xl mx-auto">
              From Midtown to the Westside, from the BeltLine to the suburbs — young-adult ministries
              are already at work across this city. YAN is the thread that connects them.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
              <Image src="/images/yan/source/atlanta-beltline-bridge.jpg" alt="The Atlanta BeltLine, a walkable corridor connecting neighborhoods across the city" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-yan-navy/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
                {["Midtown", "Westside", "BeltLine", "Decatur", "East Point"].map((n) => (
                  <span key={n} className="yan-pill">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Fall 2026 Leaders Roundtable */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-skyline-night.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/80" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Fall 2026</p>
            <h2 className="yan-h2 text-white mb-4">{featuredEvent ? featuredEvent.title : "The YAN Leaders Roundtable"}</h2>
            <p className="yan-body text-white/70 mb-8 max-w-xl mx-auto">
              {featuredEvent?.summary ??
                "A gathering for pastors and leaders currently serving young adults across Atlanta — details are being prepared. Register your interest now and be first to know when the date, venue, and capacity are confirmed."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/events/atlanta" className="yan-btn-primary">
                {featuredEvent ? "View event details" : "Register your interest"}
              </Link>
              <Link href="/yan/events/atlanta" className="yan-btn-secondary">
                See all events
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Network preview */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <YanEmptyState
              eyebrow="The Network"
              title="The map is being formed."
              body="Atlanta's young-adult ministries are just beginning to connect here. If you lead one, be a founding member — if you're looking for community, ask us to notify you when discovery opens."
              ctaHref="/yan/network/atlanta"
              ctaLabel="Explore the network"
            />
          </FadeInSection>
        </div>
      </section>

      {/* Leaders / Stories preview */}
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
          <FadeInSection>
            <div className="yan-card h-full flex flex-col">
              <p className="yan-eyebrow mb-2">Leaders</p>
              <h3 className="yan-h3 text-yan-navy mb-2">Atlanta&apos;s leaders, coming soon.</h3>
              <p className="text-sm text-yan-navy/60 font-yan-body mb-6 flex-1">
                We&apos;ll introduce the pastors and ministry leaders shaping this movement here as the
                network grows.
              </p>
              <Link href="/yan/leaders/atlanta" className="yan-btn-ghost text-sm self-start">
                Meet the leaders
              </Link>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="yan-card h-full flex flex-col">
              <p className="yan-eyebrow mb-2">Stories</p>
              <h3 className="yan-h3 text-yan-navy mb-2">The first stories are coming soon.</h3>
              <p className="text-sm text-yan-navy/60 font-yan-body mb-6 flex-1">
                As ministries connect and young adults find community, we&apos;ll share real, approved
                stories of what God is doing across the city.
              </p>
              <Link href="/yan/stories/atlanta" className="yan-btn-ghost text-sm self-start">
                Read stories
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Cross-city callout */}
      <section className="bg-white py-16 sm:py-20 border-t border-yan-navy/5">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">Beyond Atlanta</p>
          <h2 className="yan-h3 text-yan-navy mb-4">This is where it started. It doesn&apos;t end here.</h2>
          <p className="text-yan-navy/60 font-yan-body mb-8 max-w-xl mx-auto">
            The same movement taking shape across Atlanta is now finding its footing in other cities
            too — same foundation, same mission, led locally.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {otherCities.map((city) => (
              <Link key={city.slug} href={`/yan/${city.slug}`} className="yan-btn-ghost text-sm">
                See {city.name} &rarr;
              </Link>
            ))}
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
