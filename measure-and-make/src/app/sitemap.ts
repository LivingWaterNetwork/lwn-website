import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/content/projects";
import { SITE_URL } from "@/content/site";

/**
 * Static routes plus Public + Approved project slugs only. A Draft or Private
 * slug must never appear here (07-DEVELOPER-CONTENT-MAP.md). The two legal
 * placeholder pages are excluded while they are still placeholder text.
 */
const STATIC_PATHS = [
  "",
  "/work",
  "/capabilities",
  "/process",
  "/about",
  "/contact",
];

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
