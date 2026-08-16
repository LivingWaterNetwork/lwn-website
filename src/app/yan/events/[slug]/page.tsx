import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanEventRegisterForm } from "@/components/yan/sections/YanEventRegisterForm";
import { buildIcsDataUri } from "@/lib/yanIcs";

export const dynamic = "force-dynamic";

async function getEvent(slug: string) {
  return safeYanQuery(() => prisma.yanEvent.findUnique({ where: { slug }, include: { registrations: true } }), null);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEvent(params.slug);
  if (!event) return { title: "Event" };
  return {
    ...canonical(`/yan/events/${event.slug}`),
    title: event.title,
    description: event.summary,
  };
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function YanEventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) notFound();

  const capacity = event.capacity;
  const activeCount = event.registrations.filter((r) => r.status === "registered").length;
  const isFull = typeof capacity === "number" && activeCount >= capacity;
  const canRegister = event.status === "published" || event.status === "coming-soon";

  const eventJsonLd = event.startsAt
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        startDate: event.startsAt.toISOString(),
        ...(event.endsAt ? { endDate: event.endsAt.toISOString() } : {}),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: event.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
        description: event.summary,
        ...(event.venueName
          ? { location: { "@type": "Place", name: event.venueName, address: event.venueAddress ?? undefined } }
          : {}),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "YAN Atlanta", path: "/yan" },
              { name: "Events", path: "/yan/events" },
              { name: event.title, path: `/yan/events/${event.slug}` },
            ])
          ),
        }}
      />
      {eventJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />}

      <section className="py-16 sm:py-24 bg-yan-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">{event.eventType.replace(/-/g, " ")}</p>
          <h1 className="yan-h1 text-white mb-4">{event.title}</h1>
          <p className="yan-body text-white/70 mb-6 text-lg">{event.summary}</p>

          <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-8">
            {event.startsAt ? (
              <div className="yan-card-dark">
                <dt className="text-white/50 text-xs uppercase tracking-wide mb-1">When</dt>
                <dd className="text-white">{formatDate(event.startsAt)}</dd>
              </div>
            ) : (
              <div className="yan-card-dark">
                <dt className="text-white/50 text-xs uppercase tracking-wide mb-1">When</dt>
                <dd className="text-white/70">Details coming soon</dd>
              </div>
            )}
            <div className="yan-card-dark">
              <dt className="text-white/50 text-xs uppercase tracking-wide mb-1">Where</dt>
              <dd className="text-white/70">{event.venueName ?? "Venue to be announced"}</dd>
            </div>
            {event.audience && (
              <div className="yan-card-dark sm:col-span-2">
                <dt className="text-white/50 text-xs uppercase tracking-wide mb-1">Who should attend</dt>
                <dd className="text-white/70">{event.audience}</dd>
              </div>
            )}
          </dl>

          {event.startsAt && (
            <a
              href={buildIcsDataUri({
                title: event.title,
                description: event.summary,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                venueName: event.venueName,
              })}
              download={`${event.slug}.ics`}
              className="yan-btn-secondary inline-flex text-sm"
            >
              Add to calendar
            </a>
          )}
        </div>
      </section>

      {event.description && (
        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="yan-body text-yan-navy/70 whitespace-pre-line">{event.description}</p>
          </div>
        </section>
      )}

      <section className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          {event.status === "cancelled" ? (
            <p className="text-center text-yan-navy/60">This event has been cancelled.</p>
          ) : event.status === "past" ? (
            <p className="text-center text-yan-navy/60">This event has already taken place.</p>
          ) : isFull && !event.waitlistEnabled ? (
            <p className="text-center text-yan-navy/60">Registration is full and the waitlist is closed.</p>
          ) : canRegister ? (
            <>
              <h2 className="yan-h3 text-yan-navy text-center mb-6">
                {isFull ? "Join the waitlist" : "Register to attend"}
              </h2>
              <YanEventRegisterForm eventId={event.id} />
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
