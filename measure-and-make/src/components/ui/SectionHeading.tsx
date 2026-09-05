import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { SplitText } from "./SplitText";

/**
 * `size` is the section's weight in the page, not decoration. Every section
 * heading being the same size is what makes a page read as a template, so a
 * page is expected to use more than one: "lead" for the section a page turns
 * on, "base" for the ordinary run, "quiet" for a heading that only labels the
 * block under it.
 */
const sizes = {
  lead: "text-[2rem] leading-[1.08] sm:text-5xl lg:text-[3.25rem]",
  base: "text-3xl leading-tight sm:text-4xl",
  quiet: "text-2xl leading-snug sm:text-3xl",
} as const;

export function SectionHeading({
  eyebrow,
  headline,
  children,
  tone = "dark",
  align = "left",
  size = "base",
  /** Set false where the heading sits in its own column and the copy elsewhere. */
  rule = true,
}: {
  eyebrow?: string;
  headline: string;
  children?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  size?: keyof typeof sizes;
  rule?: boolean;
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <SplitText
        as="h2"
        text={headline}
        className={`mt-4 font-display ${sizes[size]} ${
          tone === "light" ? "text-limestone" : "text-forest"
        }`}
      />
      {rule ? (
        <div
          className={`mt-6 ${align === "center" ? "mx-auto" : ""} rule-brass`}
        />
      ) : null}
      {children ? (
        <div
          className={`mt-6 max-w-prose font-sans text-lg leading-relaxed ${
            tone === "light" ? "text-sage" : "text-field"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
