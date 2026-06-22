import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const { meta, content } = post;

  return (
    <>
      <section className="bg-teal py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold uppercase tracking-wider text-gold bg-gold/20 px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            {meta.title}
          </h1>
          <div className="mt-4 text-white/60 text-sm">
            {meta.author}
            {meta.date && (
              <>
                {" · "}
                {new Date(meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-serif prose-headings:text-teal prose-a:text-teal prose-blockquote:border-gold prose-blockquote:text-charcoal/70 max-w-none">
          <MDXRemote source={content} />
        </article>
      </section>

      <section className="py-10 bg-stone-50 border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-charcoal/60 hover:text-teal transition-colors">
            ← Back to Blog
          </Link>
          <Link href="/cohort" className="btn-gold text-sm">
            Join the Network
          </Link>
        </div>
      </section>
    </>
  );
}
