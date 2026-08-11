import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags?: string[];
}

// Posts with a future `date` in frontmatter are treated as scheduled —
// written and deployed now, but hidden from the public list and direct
// links until their date arrives. This lets Omar batch-write posts ahead
// of time and have them "drip" out weekly without a new deploy each week.
// Because these pages are already `force-dynamic` (see blog/page.tsx and
// blog/[slug]/page.tsx), this check re-runs on every request rather than
// being baked in at build time.
function isPublished(dateStr: string): boolean {
  if (!dateStr) return true; // no date = always show, don't accidentally hide undated posts
  const postDate = new Date(dateStr);
  if (Number.isNaN(postDate.getTime())) return true;
  return postDate.getTime() <= Date.now();
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const files = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const fullPath = path.join(postsDirectory, filename);
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        slug,
        title: data.title ?? "Untitled",
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        author: data.author ?? "Living Water Network",
        tags: data.tags ?? [],
      } as PostMeta;
    })
    .filter((post) => isPublished(post.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): { meta: PostMeta; content: string } | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  // A future-dated post 404s on its direct URL too — otherwise a shared
  // link (or a guessed slug) could leak it before its scheduled date.
  if (!isPublished(data.date ?? "")) return null;

  return {
    meta: {
      slug,
      title: data.title ?? "Untitled",
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
      author: data.author ?? "Living Water Network",
      tags: data.tags ?? [],
    },
    content,
  };
}
