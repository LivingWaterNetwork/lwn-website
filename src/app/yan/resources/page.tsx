import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanResourceSubmitForm } from "@/components/yan/sections/YanResourceSubmitForm";
import { track } from "@/lib/yanAnalytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/resources"),
  title: "Resources",
  description: "Leader tools, curriculum, prayer guides, event kits, and training shared across YAN Atlanta's network of young-adult ministries.",
};

export default async function YanResourcesPage() {
  const resources = await safeYanQuery(
    () => prisma.yanResource.findMany({ where: { status: "published" }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Resources", path: "/yan/resources" }])),
        }}
      />
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
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((r) => (
                <li key={r.id} className="yan-card">
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
                </li>
              ))}
            </ul>
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
