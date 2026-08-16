import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...canonical("/yan/events"),
  title: "Events",
  description:
    "The Fall 2026 YAN Leaders Roundtable and future gatherings for Atlanta's young-adult ministry leaders — roundtables, prayer gatherings, worship nights, and more.",
};

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default async function YanEventsPage() {
  const events = await safeYanQuery(
    () => prisma.yanEvent.findMany({ where: { status: { in: ["coming-soon", "published", "past"] } }, orderBy: { startsAt: "asc" } }),
    []
  );

  const upcoming = events.filter((e) => e.status !== "past");
  const past = events.filter((e) => e.status === "past");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Events", path: "/yan/events" }])),
        }}
      />
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-oakland-cemetery-church.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">Events</p>
          <h1 className="yan-h1 text-white mb-4">Gathering Atlanta&apos;s leaders.</h1>
          <p className="yan-body text-white/70 max-w-xl mx-auto">
            Roundtables, prayer gatherings, worship nights, service projects, and resource
            exchanges — starting with the Fall 2026 Leaders Roundtable.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {upcoming.length === 0 ? (
            <YanEmptyState
              eyebrow="Fall 2026"
              title="The Leaders Roundtable is coming."
              body="The exact date, venue, and capacity are still being finalized. Register your interest now and be first to know when details are confirmed."
              ctaHref="/yan/join?path=roundtable-interest"
              ctaLabel="Register your interest"
            />
          ) : (
            <ul className="space-y-4">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <Link href={`/yan/events/${event.slug}`} className="yan-card block hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="yan-eyebrow mb-1">{event.eventType.replace(/-/g, " ")}</p>
                        <h2 className="yan-h3 text-yan-navy">{event.title}</h2>
                        {formatDate(event.startsAt) && <p className="text-sm text-yan-navy/50 mt-1">{formatDate(event.startsAt)}</p>}
                      </div>
                      {event.status === "coming-soon" && <span className="yan-pill !text-yan-clay !border-yan-clay/40 !bg-yan-clay/10 shrink-0">Coming soon</span>}
                    </div>
                    <p className="text-sm text-yan-navy/60 mt-3 line-clamp-2">{event.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {past.length > 0 && (
            <div className="mt-16">
              <h2 className="yan-h3 text-yan-navy mb-4">Past events</h2>
              <ul className="space-y-3">
                {past.map((event) => (
                  <li key={event.id}>
                    <Link href={`/yan/events/${event.slug}`} className="text-yan-navy/60 hover:text-yan-blue text-sm">
                      {event.title} — {formatDate(event.startsAt)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
