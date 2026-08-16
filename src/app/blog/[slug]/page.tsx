import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { BlogPostContent } from "@/components/sections/BlogPostContent";

// Forced dynamic so a scheduled (future-dated) post's page actually 404s
// until its date arrives, and starts resolving the moment it passes,
// without a new deploy — see isPublished() in src/lib/blog.ts.
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found on Living Water Network.",
    };
  }
  const title = post.meta.title;
  const description =
    post.meta.excerpt ||
    "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship from Living Water Network.";
  return {
    title,
    description,
    alternates: { canonical: `/blog/${params.slug}` },
    authors: post.meta.author ? [{ name: post.meta.author }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.meta.date || undefined,
      authors: post.meta.author ? [post.meta.author] : undefined,
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { meta, content } = post;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.excerpt || undefined,
    datePublished: meta.date || undefined,
    author: {
      "@type": "Person",
      name: meta.author || "Living Water Network",
    },
    publisher: {
      "@type": "Organization",
      name: "Living Water Network",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${meta.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogPostContent meta={meta}>
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-serif prose-headings:text-navy prose-a:text-[#0A77BC] prose-blockquote:border-copper prose-blockquote:text-slate max-w-none">
          <MDXRemote source={content} />
        </article>
      </BlogPostContent>
    </>
  );
}
