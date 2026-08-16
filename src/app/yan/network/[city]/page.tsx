import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanNetworkContent } from "@/components/yan/sections/YanNetworkContent";
import { YanGroupSuggestForm } from "@/components/yan/sections/YanGroupSuggestForm";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getYanCity(params.city);
  if (!city) return { title: "Network" };
  return {
    ...canonical(`/yan/network/${city.slug}`),
    title: `Network Directory — ${city.name}`,
    description:
      city.slug === "atlanta"
        ? "Discover the young-adult ministries, groups, and leaders already serving metro Atlanta — searchable by neighborhood, meeting day, and gathering type."
        : `YAN ${city.name}'s network directory is just beginning — see the real picture of who this hub exists to serve, and be one of the first to join it.`,
  };
}

export default async function YanNetworkCityPage({ params }: { params: { city: string } }) {
  const city = getYanCity(params.city);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "YAN", path: "/yan" },
    { name: "Network", path: "/yan/network" },
    { name: city.name, path: `/yan/network/${city.slug}` },
  ]);

  if (city.slug !== "atlanta") {
    const stats = getCityStats(city.slug, ["youngAdults", "faith"]);
    const otherCities = getOtherCities(city.slug);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <section className="py-16 sm:py-20 bg-yan-navy text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">The Network &middot; {city.name}</p>
            <h1 className="yan-h1 text-white mb-4">{city.name}&apos;s network is just beginning.</h1>
            <p className="yan-body text-white/65 max-w-xl mx-auto">
              There&apos;s no directory here yet — {city.name} is a {city.stageBadge.toLowerCase()}. Here&apos;s the
              real picture of who this network exists to serve.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanStatsStrip stats={stats} />
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-yan-stone">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanGroupSuggestForm city={city.name} />
          </div>
        </section>

        <section className="py-14 sm:py-16 bg-white border-t border-yan-navy/5 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow mb-3">Already Live</p>
            <p className="text-yan-navy/60 font-yan-body mb-6">
              See Atlanta&apos;s network — the same directory {city.name}&apos;s will grow into.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/network/atlanta" className="yan-btn-ghost text-sm">
                See Atlanta&apos;s network &rarr;
              </Link>
              {otherCities
                .filter((c) => c.slug !== "atlanta")
                .map((c) => (
                  <Link key={c.slug} href={`/yan/network/${c.slug}`} className="yan-btn-ghost text-sm">
                    See {c.name} &rarr;
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  const groups = await safeYanQuery(
    () => prisma.yanGroup.findMany({ where: { status: "published", city: "Atlanta" }, orderBy: [{ featured: "desc" }, { name: "asc" }] }),
    []
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-graffiti-underpass.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">The Network</p>
          <h1 className="yan-h1 text-white mb-4">Atlanta&apos;s young-adult ministries.</h1>
          <p className="yan-body text-white/65 max-w-2xl">
            A growing directory of the groups, ministries, and leaders already serving young adults
            across metro Atlanta — searchable by neighborhood, meeting rhythm, and focus.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {groups.length > 0 ? (
            <YanNetworkContent groups={groups} />
          ) : (
            <YanEmptyState
              eyebrow="The Network"
              title="The map is being formed."
              body="No groups have been published yet — Atlanta's young-adult ministries are just beginning to connect here. Be one of the first."
              ctaHref="#add-your-group"
              ctaLabel="Add your group"
            />
          )}
        </div>
      </section>

      <section id="add-your-group" className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanGroupSuggestForm />
        </div>
      </section>
    </>
  );
}
