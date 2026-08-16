import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/stories"),
  title: "Stories",
  description:
    "Testimonies, movement moments, and collaboration stories from YAN's young-adult ministries, city by city.",
};

export default function YanStoriesGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Stories", path: "/yan/stories" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="stories"
        eyebrow="Stories"
        title="What God is already doing, city by city."
        intro="Real testimonies, movement moments, and collaboration stories look different in every city — shaped by the young adults and leaders actually living them. Find your city to read what's real there."
        primaryCategory="engagement"
      />
    </>
  );
}
