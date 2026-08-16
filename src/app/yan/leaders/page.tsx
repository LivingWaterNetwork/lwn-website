import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { YanLeaderNominateForm } from "@/components/yan/sections/YanLeaderNominateForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/leaders"),
  title: "Leader & Ministry Spotlights",
  description: "Meet the pastors and ministry leaders shaping YAN Atlanta's citywide young-adult movement.",
};

export default async function YanLeadersPage() {
  const leaders = await safeYanQuery(
    () => prisma.yanLeader.findMany({ where: { status: "published" }, orderBy: [{ featured: "desc" }, { name: "asc" }] }),
    []
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Leaders", path: "/yan/leaders" }])),
        }}
      />
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
          {leaders.length === 0 ? (
            <YanEmptyState
              title="Atlanta's leaders will be introduced here."
              body="As the network grows, we'll spotlight the pastors and ministry leaders driving this movement forward — with their full consent."
              ctaHref="#nominate"
              ctaLabel="Nominate a leader"
            />
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {leaders.map((leader) => (
                <li key={leader.id} className="yan-card">
                  <h3 className="yan-h3 !text-lg text-yan-navy mb-1">{leader.name}</h3>
                  {(leader.role || leader.ministryName) && (
                    <p className="text-xs text-yan-navy/40 mb-3">{[leader.role, leader.ministryName].filter(Boolean).join(" · ")}</p>
                  )}
                  <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed line-clamp-4">{leader.bio}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="nominate" className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanLeaderNominateForm />
        </div>
      </section>
    </>
  );
}
