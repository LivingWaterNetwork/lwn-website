import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship from Living Water Network.",
  openGraph: {
    title: "Blog | Living Water Network",
    description:
      "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Living Water Network",
    description:
      "Insights on spiritual formation, Christian leadership development, and discipleship-based mentorship.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Insights &amp; Encouragement</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">The Living Water Blog</h1>
          <p className="mt-4 text-white/65 font-sans">
            Reflections on spiritual formation, Kingdom leadership, and discipleship.
          </p>
        </div>
      </section>

      <section className="py-20 bg-mist">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">✍️</p>
              <h2 className="font-serif text-2xl font-semibold text-navy mb-3">Posts Coming Soon</h2>
              <p className="text-slate text-sm font-sans">
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
                            className="text-xs font-extrabold uppercase tracking-wider text-[#0A77BC] bg-[#0A77BC]/10 px-2.5 py-0.5 rounded-full font-sans"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="font-serif text-2xl font-semibold text-navy hover:text-[#0A77BC] transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt && (
                      <p className="text-slate text-sm leading-relaxed font-sans">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-mist">
                      <div className="text-xs text-slate/60 font-sans">
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
                      <Link href={`/blog/${post.slug}`} className="text-[#0A77BC] text-sm font-semibold hover:underline font-sans">
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

      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Don&apos;t Miss a Post</p>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
            Get Formation Insights in Your Inbox
          </h2>
          <div className="flex justify-center">
            <NewsletterSignup dark />
          </div>
        </div>
      </section>
    </>
  );
}
