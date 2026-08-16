import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanResourceSubmitForm } from "@/components/yan/sections/YanResourceSubmitForm";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";
import { track } from "@/lib/yanAnalytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getYanCity(params.city);
  if (!city) return { title: "Resources" };
  return {
    ...canonical(`/yan/resources/${city.slug}`),
    title: `Resources — ${city.name}`,
    description:
      city.slug === "atlanta"
        ? "Leader tools, curriculum, prayer guides, event kits, and training shared across YAN Atlanta's network of young-adult ministries."
        : `YAN ${city.name}'s resource library is just beginning — see the real needs this hub exists to serve.`,
  };
}

export default async function YanResourcesCityPage({ params }: { params: { city: string } }) {
  const city = getYanCity(params.city);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "YAN", path: "/yan" },
    { name: "Resources", path: "/yan/resources" },
    { name: city.name, path: `/yan/resources/${city.slug}` },
  ]);

  const resources = await safeYanQuery(
    () => prisma.yanResource.findMany({ where: { status: "published", city: city.name }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
    []
  );

  if (city.slug !== "atlanta") {
    const stats = getCityStats(city.slug, ["homelessness", "mentalHealth"]);
    const otherCities = getOtherCities(city.slug);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <section className="py-16 sm:py-24 bg-yan-navy text-center">
          <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Resources &middot; {city.name}</p>
            <h1 className="yan-h1 text-white mb-4">
              {resources.length > 0 ? "Shared tools for shared ministry." : `${city.name}'s resource library is just beginning.`}
            </h1>
            <p className="yan-body text-white/65 max-w-xl mx-auto">
              {resources.length > 0
                ? `Leader tools, curriculum, prayer guides, event kits, and training — built by and for ${city.name}'s young-adult ministries.`
                : `Here's the real context leaders and young adults in ${city.name} are navigating — the need this library exists to help meet.`}
            </p>
          </FadeInSection>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {resources.length > 0 ? (
              <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {resources.map((r) => (
                  <StaggerItem key={r.id}>
                    <div className="yan-card h-full">
                      <p className="yan-eyebrow mb-2">{r.resourceType.replace(/-/g, " ")}</p>
                      <h3 className="yan-h3 !text-lg text-yan-navy mb-2">{r.title}</h3>
                      <p className="text-sm text-yan-navy/60 font-yan-body leading-relaxed mb-3 line-clamp-3">{r.description}</p>
                      {(r.fileUrl || r.externalUrl) && (
                        <a
                          href={r.fileUrl ?? r.externalUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track("yan_resource_opened", { resource: r.slug })}
                          className="text-yan-blue text-sm font-semibold"
                        >
                          Open resource
                        </a>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <YanStatsStrip stats={stats} />
            )}
          </div>
        </section>

        <section id="submit-resource" className="py-14 sm:py-20 bg-yan-stone">
          <FadeInSection className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanResourceSubmitForm city={city.name} />
          </FadeInSection>
        </section>

        <section className="py-14 sm:py-16 bg-white border-t border-yan-navy/5 text-center">
          <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow mb-3">Already Live</p>
            <p className="text-yan-navy/60 font-yan-body mb-6">Browse Atlanta&apos;s resource library.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/resources/atlanta" className="yan-btn-ghost text-sm">
                Browse Atlanta&apos;s resources &rarr;
              </Link>
              {otherCities
                .filter((c) => c.slug !== "atlanta")
                .map((c) => (
                  <Link key={c.slug} href={`/yan/resources/${c.slug}`} className="yan-btn-ghost text-sm">
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
          <Image src="/images/yan/source/young-adults-walking-coffee.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Resources</p>
          <h1 className="yan-h1 text-white mb-4">Shared tools for shared ministry.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            Leader tools, curriculum, prayer guides, event kits, reading, training, and shared
            opportunities — built by and for Atlanta&apos;s young-adult ministries.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {resources.length === 0 ? (
            <YanEmptyState
              title="The resource library is being built."
              body="As leaders share tools, guides, and curriculum, they'll appear here for the whole network to use."
              ctaHref="#submit-resource"
              ctaLabel="Submit a resource"
            />
          ) : (
            <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((r) => (
                <StaggerItem key={r.id}>
                  <div className="yan-card h-full">
                    <p className="yan-eyebrow mb-2">{r.resourceType.replace(/-/g, " ")}</p>
                    <h3 className="yan-h3 !text-lg text-yan-navy mb-2">{r.title}</h3>
                    <p className="text-sm text-yan-navy/60 font-yan-body leading-relaxed mb-3 line-clamp-3">{r.description}</p>
                    {(r.fileUrl || r.externalUrl) && (
                      <a
                        href={r.fileUrl ?? r.externalUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("yan_resource_opened", { resource: r.slug })}
                        className="text-yan-blue text-sm font-semibold"
                      >
                        Open resource
                      </a>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      <section id="submit-resource" className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanResourceSubmitForm />
        </div>
      </section>
    </>
  );
}
