import {
  HOSTING_STATEMENT,
  RELATIONSHIP_DISCLOSURE,
} from "@/content/site";

/**
 * The single source of truth for the Living Water Network relationship language
 * on this site. The wording comes from 01-BRAND-FOUNDATION.md §8 via
 * src/content/site.ts and is approved as an interim draft only (Claims Register
 * row 21). It must not be re-typed, reworded, softened, or strengthened per page.
 */
export function RelationshipDisclosure({
  includeHostingStatement = false,
  tone = "dark",
  /**
   * "small" is the footer's fine print. "body" is for places the copy has to
   * read as ordinary page text rather than fine print — the About page asks for
   * plain language, not hidden.
   */
  size = "small",
  className = "",
}: {
  includeHostingStatement?: boolean;
  tone?: "dark" | "light";
  size?: "small" | "body";
  className?: string;
}) {
  return (
    <div
      className={`font-sans leading-relaxed ${
        size === "body" ? "text-lg" : "text-xs"
      } ${tone === "light" ? "text-sage" : "text-field"} ${className}`}
    >
      <p className="max-w-prose">{RELATIONSHIP_DISCLOSURE}</p>
      {includeHostingStatement ? (
        <p className="mt-2 max-w-prose">{HOSTING_STATEMENT}</p>
      ) : null}
    </div>
  );
}
