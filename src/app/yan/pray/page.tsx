import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/pray"),
  title: "Pray for Your City",
  description:
    "Join YAN in covering each city, its churches, and its next generation in prayer — find your city for its prayer themes and to submit a request.",
};

export default function YanPrayGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Pray", path: "/yan/pray" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="pray"
        eyebrow="Pray"
        title="Prayer is our first response."
        intro="Before strategy, before growth — prayer comes first, for every church, leader, and young adult in every YAN city. Find your city for its prayer themes, and to submit your own request, private or shared."
        primaryCategory="mentalHealth"
      />
    </>
  );
}
