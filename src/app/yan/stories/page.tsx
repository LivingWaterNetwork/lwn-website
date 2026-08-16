import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanStorySubmitForm } from "@/components/yan/sections/YanStorySubmitForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/stories"),
  title: "Stories",
  description: "Testimonies, movement moments, and collaboration stories from Atlanta's young-adult ministries.",
};

export default async function YanStoriesPage() {
  const stories = await safeYanQuery(
    () => prisma.yanStory.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }),
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Stories", path: "/yan/stories" }])),
        }}
      />
      <section className="py-16 sm:py-24 bg-yan-navy text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
