import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/leaders"),
  title: "Leader & Ministry Spotlights",
  description:
    "Meet the pastors and ministry leaders shaping YAN's citywide young-adult movements — find your city to see who's leading there.",
};

export default function YanLeadersGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Leaders", path: "/yan/leaders" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="leaders"
        eyebrow="Leaders"
        title="The pastors and leaders driving this forward."
        intro="Behind every ministry in this network is a leader who said yes first. Each city introduces its own pastors and ministry leaders here — the heartbeat of that hub's movement. Find your city to meet them."
        primaryCategory="faith"
      />
    </>
  );
}
