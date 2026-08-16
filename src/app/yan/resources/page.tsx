import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanPageCityGateway } from "@/components/yan/gateway/YanPageCityGateway";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...canonical("/yan/resources"),
  title: "Resources",
  description:
    "Leader tools, curriculum, prayer guides, event kits, and training shared across YAN's network of young-adult ministries — find your city's library.",
};

export default function YanResourcesGatewayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Resources", path: "/yan/resources" }])),
        }}
      />
      <YanPageCityGateway
        pageSlug="resources"
        eyebrow="Resources"
        title="Shared tools for shared ministry."
        intro="Leader tools, curriculum, prayer guides, event kits, reading, and training — built by and for the young-adult ministries in each YAN city. Find your city's library, or see what's already shared elsewhere."
        primaryCategory="homelessness"
      />
    </>
  );
}
