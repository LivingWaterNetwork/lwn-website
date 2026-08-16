import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPrayerRequestForm } from "@/components/yan/sections/YanPrayerRequestForm";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/pray"),
  title: "Pray for Atlanta",
  description: "Join YAN Atlanta in covering the city, its churches, and the next generation in prayer — and submit your own prayer request.",
};

export default async function YanPrayPage() {
  const themes = await safeYanQuery(() => prisma.yanPrayerTheme.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }), []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Pray", path: "/yan/pray" }])),
        }}
      />
      <section className="relative py-16 sm:py-24 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-oakland-cemetery-church.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Pray</p>
          <h1 className="yan-h1 text-white mb-4">Covering the city in prayer.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            Prayer is our first response — for our churches, our leaders, and the next generation of
            Atlanta.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {themes.length === 0 ? (
            <YanEmptyState
              eyebrow="Prayer Themes"
              title="Citywide prayer themes are being prepared."
              body="Weekly prayer prompts for Atlanta's churches and leaders will appear here soon."
              ctaHref="#submit-request"
              ctaLabel="Submit a prayer request"
            />
          ) : (
            <ul className="space-y-4">
              {themes.map((theme) => (
                <li key={theme.id} className="yan-card">
                  <h2 className="yan-h3 text-yan-navy mb-2">{theme.title}</h2>
                  <p className="text-sm text-yan-navy/65 font-yan-body leading-relaxed mb-2">{theme.body}</p>
                  {theme.scriptureRef && <p className="text-xs text-yan-blue font-semibold">{theme.scriptureRef}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="submit-request" className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="yan-h3 text-yan-navy text-center mb-6">Submit a prayer request</h2>
          <YanPrayerRequestForm />
        </div>
      </section>
    </>
  );
}
