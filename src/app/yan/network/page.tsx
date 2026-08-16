import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanNetworkContent } from "@/components/yan/sections/YanNetworkContent";
import { YanGroupSuggestForm } from "@/components/yan/sections/YanGroupSuggestForm";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/network"),
  title: "Network Directory",
  description:
    "Discover the young-adult ministries, groups, and leaders already serving metro Atlanta — searchable by neighborhood, meeting day, and gathering type.",
};

export default async function YanNetworkPage() {
  const groups = await safeYanQuery(
    () => prisma.yanGroup.findMany({ where: { status: "published" }, orderBy: [{ featured: "desc" }, { name: "asc" }] }),
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Network", path: "/yan/network" }])),
        }}
      />
      <section className="py-16 sm:py-20 bg-yan-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
