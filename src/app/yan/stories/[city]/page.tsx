import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanStorySubmitForm } from "@/components/yan/sections/YanStorySubmitForm";
import { YanStatsStrip } from "@/components/yan/sections/YanStatsStrip";
import { getYanCity, getOtherCities } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getYanCity(params.city);
  if (!city) return { title: "Stories" };
  return {
    ...canonical(`/yan/stories/${city.slug}`),
    title: `Stories — ${city.name}`,
    description:
      city.slug === "atlanta"
        ? "Testimonies, movement moments, and collaboration stories from Atlanta's young-adult ministries."
        : `The first stories from YAN ${city.name} haven't been written yet — here's the real context they'll come from.`,
  };
}

export default async function YanStoriesCityPage({ params }: { params: { city: string } }) {
  const city = getYanCity(params.city);
  if (!city) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "YAN", path: "/yan" },
    { name: "Stories", path: "/yan/stories" },
    { name: city.name, path: `/yan/stories/${city.slug}` },
  ]);

  if (city.slug !== "atlanta") {
    const stats = getCityStats(city.slug, ["engagement", "faith"]);
    const otherCities = getOtherCities(city.slug);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <section className="py-16 sm:py-24 bg-yan-navy text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Stories &middot; {city.name}</p>
            <h1 className="yan-h1 text-white mb-4">The first {city.name} stories haven&apos;t been written yet.</h1>
            <p className="yan-body text-white/65 max-w-xl mx-auto">
              Here&apos;s the real momentum already building among young adults in {city.name} —
              the same movement these stories will eventually document.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanStatsStrip stats={stats} />
          </div>
        </section>

        <section id="share-story" className="py-14 sm:py-20 bg-yan-stone">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <YanStorySubmitForm />
          </div>
        </section>

        <section className="py-14 sm:py-16 bg-white border-t border-yan-navy/5 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-eyebrow mb-3">Already Live</p>
            <p className="text-yan-navy/60 font-yan-body mb-6">Read the first stories out of Atlanta.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/stories/atlanta" className="yan-btn-ghost text-sm">
                Read Atlanta&apos;s stories &rarr;
              </Link>
              {otherCities
                .filter((c) => c.slug !== "atlanta")
                .map((c) => (
                  <Link key={c.slug} href={`/yan/stories/${c.slug}`} className="yan-btn-ghost text-sm">
                    See {c.name} &rarr;
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  const stories = await safeYanQuery(
    () => prisma.yanStory.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }),
    []
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="relative py-16 sm:py-24 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/young-adults-park-gathering.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Stories</p>
          <h1 className="yan-h1 text-white mb-4">What God is already doing.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            Real testimonies, movement moments, and collaboration stories from across Atlanta&apos;s
            young-adult ministries.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {stories.length === 0 ? (
            <YanEmptyState
              title="The first stories are coming soon."
              body="As ministries connect and young adults find community, approved stories will be shared here."
              ctaHref="#share-story"
              ctaLabel="Share a story"
            />
          ) : (
            <ul className="space-y-6">
              {stories.map((s) => (
                <li key={s.id} className="yan-card">
                  <p className="yan-eyebrow mb-2">{s.storyType.replace(/-/g, " ")}</p>
                  <h2 className="yan-h3 text-yan-navy mb-2">{s.title}</h2>
                  <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed whitespace-pre-line">{s.body}</p>
                  {s.authorName && <p className="text-xs text-yan-navy/40 mt-3">— {s.authorName}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="share-story" className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanStorySubmitForm />
        </div>
      </section>
    </>
  );
}
