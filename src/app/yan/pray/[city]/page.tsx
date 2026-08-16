import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPrayerRequestForm } from "@/components/yan/sections/YanPrayerRequestForm";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getYanCity(params.city);
  if (!city) return { title: "Pray" };
  return {
    ...canonical(`/yan/pray/${city.slug}`),
    title: `Pray for ${city.name}`,
    description: `Join YAN ${city.name} in covering the city, its churches, and the next generation in prayer — and submit your own prayer request.`,
  };
}

export default async function YanPrayCityPage({ params }: { params: { city: string } }) {
  const city = getYanCity(params.city);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "YAN", path: "/yan" },
    { name: "Pray", path: "/yan/pray" },
    { name: city.name, path: `/yan/pray/${city.slug}` },
  ]);

  const themes = await safeYanQuery(
    () => prisma.yanPrayerTheme.findMany({ where: { status: "published", city: city.name }, orderBy: { createdAt: "desc" } }),
    []
  );

  const stats = city.slug !== "atlanta" ? getCityStats(city.slug, ["mentalHealth", "justice"]) : [];
  const otherCities = getOtherCities(city.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="relative py-16 sm:py-24 text-center overflow-hidden">
        {city.slug === "atlanta" && (
          <div className="absolute inset-0">
            <Image src="/images/yan/source/atlanta-oakland-cemetery-church.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-yan-navy/85" />
          </div>
        )}
        {city.slug !== "atlanta" && <div className="absolute inset-0 bg-yan-navy" />}
        <FadeInSection className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Pray &middot; {city.name}</p>
          <h1 className="yan-h1 text-white mb-4">Covering {city.name} in prayer.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            Prayer is our first response — for the churches, the leaders, and the next generation of
            {` ${city.name}`}.
          </p>
        </FadeInSection>
      </section>

      {city.slug !== "atlanta" && themes.length === 0 && (
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanStatsStrip stats={stats} />
          </div>
        </section>
      )}

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {themes.length === 0 ? (
            <YanEmptyState
              eyebrow="Prayer Themes"
              title="Citywide prayer themes are being prepared."
              body={
                city.slug === "atlanta"
                  ? "Weekly prayer prompts for Atlanta's churches and leaders will appear here soon."
                  : `Weekly prayer prompts for ${city.name}'s churches and leaders don't exist yet — but your prayer request is still welcome below, wherever you're praying from.`
              }
              ctaHref="#submit-request"
              ctaLabel="Submit a prayer request"
            />
          ) : (
            <StaggerChildren className="space-y-4">
              {themes.map((theme) => (
                <StaggerItem key={theme.id}>
                  <div className="yan-card">
                    <h2 className="yan-h3 text-yan-navy mb-2">{theme.title}</h2>
                    <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed mb-2">{theme.body}</p>
                    {theme.scriptureRef && <p className="text-xs text-yan-blue font-semibold">{theme.scriptureRef}</p>}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      <section id="submit-request" className="py-14 sm:py-20 bg-yan-stone">
        <FadeInSection className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="yan-h3 text-yan-navy text-center mb-6">Submit a prayer request</h2>
          <YanPrayerRequestForm city={city.name} />
        </FadeInSection>
      </section>

      {city.slug !== "atlanta" && (
        <section className="py-14 sm:py-16 bg-white border-t border-yan-navy/5 text-center">
          <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow mb-3">Already Live</p>
            <p className="text-yan-navy/60 font-yan-body mb-6">See Atlanta&apos;s weekly prayer themes.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/pray/atlanta" className="yan-btn-ghost text-sm">
                See Atlanta&apos;s prayer themes &rarr;
              </Link>
              {otherCities
                .filter((c) => c.slug !== "atlanta")
                .map((c) => (
                  <Link key={c.slug} href={`/yan/pray/${c.slug}`} className="yan-btn-ghost text-sm">
                    See {c.name} &rarr;
                  </Link>
                ))}
            </div>
          </FadeInSection>
        </section>
      )}
    </>
  );
}
