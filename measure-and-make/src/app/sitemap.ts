import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/content/projects";
import { SITE_URL } from "@/content/site";

/**
 * Static routes plus Public + Approved project slugs only. A Draft or Private
 * slug must never appear here (07-DEVELOPER-CONTENT-MAP.md).
 *
 * /privacy and /terms are excluded deliberately: both are complete but
 * noindex until the owner and counsel approve the copy. See
 * docs/LEGAL-REVIEW-HANDOFF.md.
 */
const STATIC_PATHS = ["", "/work", "/services", "/about", "/start"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
    })),
    ...getPublicProjects().map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified,
    })),
  ];
}
