const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

/**
 * Self-referencing canonical URL for a page's `metadata.alternates`. Spread
 * this into a page's `metadata` export: `{ ...metadata, ...canonical("/about") }`.
 * Prevents duplicate-content signals from query strings/trailing slashes and
 * tells Google unambiguously which URL is authoritative for each page.
 */
export function canonical(path: string) {
  return { alternates: { canonical: `${SITE_URL}${path}` } };
}

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
