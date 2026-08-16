import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanLeaderNominateForm } from "@/components/yan/sections/YanLeaderNominateForm";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getYanCity(params.city);
  if (!city) return { title: "Leaders" };
  return {
    ...canonical(`/yan/leaders/${city.slug}`),
    title: `Leader Spotlights — ${city.name}`,
    description:
      city.slug === "atlanta"
        ? "Meet the pastors and ministry leaders shaping YAN Atlanta's citywide young-adult movement."
        : `YAN ${city.name}'s leader spotlights are just beginning — see the real picture of the leaders this hub exists to support.`,
  };
}

export default async function YanLeadersCityPage({ params }: { params: { city: string } }) {
  const city = getYanCity(params.city);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "YAN", path: "/yan" },
    { name: "Leaders", path: "/yan/leaders" },
    { name: city.name, path: `/yan/leaders/${city.slug}` },
  ]);

  const leaders = await safeYanQuery(
    () => prisma.yanLeader.findMany({ where: { status: "published", city: city.name }, orderBy: [{ featured: "desc" }, { name: "asc" }] }),
    []
  );

  if (city.slug !== "atlanta") {
    const stats = getCityStats(city.slug, ["faith", "engagement"]);
    const otherCities = getOtherCities(city.slug);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <section className="py-16 sm:py-24 bg-yan-navy text-center">
          <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Leaders &middot; {city.name}</p>
            <h1 className="yan-h1 text-white mb-4">
              {leaders.length > 0 ? `${city.name}'s leaders, together.` : `${city.name} doesn't have leaders listed yet — you could be first.`}
            </h1>
            <p className="yan-body text-white/65 max-w-xl mx-auto">
              {leaders.length > 0
                ? `The pastors and ministry leaders already serving young adults across ${city.name}.`
                : `This hub is just beginning. Here's the real context of the leaders and young adults ${city.name}'s network exists to serve.`}
            </p>
          </FadeInSection>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {leaders.length > 0 ? (
              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {leaders.map((leader) => (
                  <StaggerItem key={leader.id}>
                    <div className="yan-card h-full">
                      <h3 className="yan-h3 !text-lg text-yan-navy mb-1">{leader.name}</h3>
                      {(leader.role || leader.ministryName) && (
                        <p className="text-xs text-yan-navy/40 mb-3">{[leader.role, leader.ministryName].filter(Boolean).join(" · ")}</p>
                      )}
                      <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed line-clamp-4">{leader.bio}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <YanStatsStrip stats={stats} />
            )}
          </div>
        </section>

        <section id="nominate" className="py-14 sm:py-20 bg-yan-stone">
          <FadeInSection className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanLeaderNominateForm city={city.name} />
          </FadeInSection>
        </section>

        <section className="py-14 sm:py-16 bg-white border-t border-yan-navy/5 text-center">
          <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow mb-3">Already Live</p>
            <p className="text-yan-navy/60 font-yan-body mb-6">Meet the leaders already introduced in Atlanta.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/leaders/atlanta" className="yan-btn-ghost text-sm">
                Meet Atlanta&apos;s leaders &rarr;
              </Link>
              {otherCities
                .filter((c) => c.slug !== "atlanta")
                .map((c) => (
                  <Link key={c.slug} href={`/yan/leaders/${c.slug}`} className="yan-btn-ghost text-sm">
                    See {c.name} &rarr;
                  </Link>
                ))}
            </div>
          </FadeInSection>
        </section>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="relative py-16 sm:py-24 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-mural-atlantamade.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Leaders</p>
          <h1 className="yan-h1 text-white mb-4">Atlanta&apos;s leaders, together.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            The pastors and ministry leaders already serving young adults across this city — the
            heartbeat of this movement.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanStatsStrip stats={getCityStats("atlanta", ["faith", "engagement"])} />
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {leaders.length === 0 ? (
            <YanEmptyState
              title="Atlanta's leaders will be introduced here."
              body="As the network grows, we'll spotlight the pastors and ministry leaders driving this movement forward — with their full consent."
              ctaHref="#nominate"
              ctaLabel="Nominate a leader"
            />
          ) : (
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {leaders.map((leader) => (
                <StaggerItem key={leader.id}>
                  <div className="yan-card h-full">
                    <h3 className="yan-h3 !text-lg text-yan-navy mb-1">{leader.name}</h3>
                    {(leader.role || leader.ministryName) && (
                      <p className="text-xs text-yan-navy/40 mb-3">{[leader.role, leader.ministryName].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed line-clamp-4">{leader.bio}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      <section id="nominate" className="py-14 sm:py-20 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanLeaderNominateForm />
        </div>
      </section>
    </>
  );
}
