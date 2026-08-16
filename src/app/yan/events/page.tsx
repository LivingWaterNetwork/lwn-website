import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/events"),
  title: "Events",
  description:
    "Roundtables, prayer gatherings, worship nights, and service projects for YAN's young-adult ministry leaders — find your city's calendar.",
};

export default function YanEventsGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Events", path: "/yan/events" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="events"
        eyebrow="Events"
        title="Gathering leaders, city by city."
        intro="Roundtables, prayer gatherings, worship nights, service projects, and resource exchanges — every city builds its own rhythm of gathering. Find your city's calendar, starting with Atlanta's Fall 2026 Leaders Roundtable."
        primaryCategory="loneliness"
      />
    </>
  );
}
