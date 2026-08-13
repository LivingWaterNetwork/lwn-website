"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PostMeta } from "@/lib/blog";
import { FadeInSection } from "@/components/motion/FadeInSection";

interface BlogPostContentProps {
  meta: PostMeta;
  children: ReactNode;
}

export function BlogPostContent({ meta, children }: BlogPostContentProps) {
  return (
    <>
      <FadeInSection>
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
      </FadeInSection>

      <section className="py-16 bg-white">{children}</section>

      <FadeInSection>
        <section className="py-10 bg-mist border-t border-mist">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link href="/blog" className="text-sm text-slate hover:text-[#0A77BC] transition-colors font-sans">
              ← Back to Blog
            </Link>
            <Link href="/cohort" className="btn-copper text-sm">Join the Network</Link>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
