import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/network"),
  title: "The Network",
  description:
    "YAN's network directory connects young-adult ministries, groups, and leaders city by city — find your city to see who's already serving there.",
};

export default function YanNetworkGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Network", path: "/yan/network" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="network"
        eyebrow="The Network"
        title="A directory of what God is already doing."
        intro="Every YAN city keeps its own living directory of the young-adult ministries, groups, and leaders already at work there — searchable by neighborhood, meeting rhythm, and focus. Find your city to see who's already serving where you are."
        primaryCategory="youngAdults"
      />
    </>
  );
}
