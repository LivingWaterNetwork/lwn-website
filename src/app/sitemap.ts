import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" },
    { path: "/programs", priority: 0.9, changeFrequency: "monthly" },
    { path: "/programs/counseling", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/mentorship", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/missions", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/speaking", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/coaching", priority: 0.8, changeFrequency: "monthly" },
    { path: "/programs/church-advisory", priority: 0.8, changeFrequency: "monthly" },
    { path: "/cohort", priority: 0.9, changeFrequency: "weekly" },
    { path: "/theory-of-change", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/events", priority: 0.6, changeFrequency: "weekly" },
    { path: "/partnership", priority: 0.7, changeFrequency: "monthly" },
    { path: "/partnership/inquire", priority: 0.5, changeFrequency: "monthly" },
    { path: "/partnership/multi-year-pledge", priority: 0.5, changeFrequency: "monthly" },
    { path: "/partnership/sponsor-the-gala", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/donate", priority: 0.7, changeFrequency: "monthly" },
    { path: "/yan", priority: 0.8, changeFrequency: "weekly" },
    { path: "/yan/atlanta", priority: 0.8, changeFrequency: "weekly" },
    { path: "/yan/new-york", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/los-angeles", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/phoenix", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/network", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/network/atlanta", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/network/new-york", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/network/los-angeles", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/network/phoenix", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/events", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/events/atlanta", priority: 0.7, changeFrequency: "weekly" },
    { path: "/yan/events/new-york", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/events/los-angeles", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/events/phoenix", priority: 0.5, changeFrequency: "weekly" },
    { path: "/yan/leaders", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/leaders/atlanta", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/leaders/new-york", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/leaders/los-angeles", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/leaders/phoenix", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/pray", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/pray/atlanta", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/pray/new-york", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/pray/los-angeles", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/pray/phoenix", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/resources", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/resources/atlanta", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/resources/new-york", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/resources/los-angeles", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/resources/phoenix", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/stories", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/stories/atlanta", priority: 0.6, changeFrequency: "weekly" },
    { path: "/yan/stories/new-york", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/stories/los-angeles", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/stories/phoenix", priority: 0.4, changeFrequency: "weekly" },
    { path: "/yan/join", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
