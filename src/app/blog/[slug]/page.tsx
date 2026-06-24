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
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-extrabold uppercase tracking-wider text-spring bg-white/10 px-2.5 py-0.5 rounded-full font-sans"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">{meta.title}</h1>
          <div className="mt-4 text-white/55 text-sm font-sans">
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
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-serif prose-headings:text-navy prose-a:text-[#0A77BC] prose-blockquote:border-copper prose-blockquote:text-slate max-w-none">
          <MDXRemote source={content} />
        </article>
      </section>

      <section className="py-10 bg-mist border-t border-mist">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-slate hover:text-[#0A77BC] transition-colors font-sans">
            ← Back to Blog
          </Link>
          <Link href="/cohort" className="btn-copper text-sm">Join the Network</Link>
        </div>
      </section>
    </>
  );
}
