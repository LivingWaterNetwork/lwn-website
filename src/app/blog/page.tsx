import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogContent } from "@/components/sections/BlogContent";

// Forced dynamic so future-dated ("scheduled") posts in content/blog
// actually disappear/appear on their date without a new deploy — see the
// isPublished() filter in src/lib/blog.ts for the scheduling logic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship from Living Water Network.",
  openGraph: {
    title: "Blog | Living Water Network",
    description:
      "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Living Water Network",
    description:
      "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogContent posts={posts} />;
}
