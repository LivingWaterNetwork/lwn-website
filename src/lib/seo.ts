const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

export interface BreadcrumbItem {
  name: string;
  path: string; // e.g. "/programs/coaching"
}

/** BreadcrumbList JSON-LD for an interior page. `items` should NOT include Home — it's added automatically. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const allItems = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
