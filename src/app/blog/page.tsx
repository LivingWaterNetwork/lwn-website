import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on spiritual formation, discipleship, and Kingdom leadership from Living Water Network.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="bg-teal py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Insights & Encouragement
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            The Living Water Blog
          </h1>
          <p className="mt-4 text-white/70">
            Reflections on spiritual formation, Kingdom leadership, and discipleship.
          </p>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">✍️</p>
              <h2 className="font-serif text-2xl font-bold text-teal mb-3">
                Posts Coming Soon
              </h2>
              <p className="text-charcoal/60 text-sm">
                We&apos;re preparing articles on spiritual formation and Kingdom leadership.
                Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.slug} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-3">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-serif text-2xl font-bold text-teal hover:text-teal-light transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-charcoal/70 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="text-xs text-charcoal/50">
                        <span className="font-medium">{post.author}</span>
                        {post.date && (
                          <>
                            {" · "}
                            {new Date(post.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </>
                        )}
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-teal text-sm font-semibold hover:underline"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
