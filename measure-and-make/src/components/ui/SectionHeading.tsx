import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  headline,
  children,
  tone = "dark",
  align = "left",
}: {
  eyebrow?: string;
  headline: string;
  children?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl`}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`mt-4 font-display text-3xl leading-tight sm:text-4xl ${
          tone === "light" ? "text-limestone" : "text-forest"
        }`}
      >
        {headline}
      </h2>
      <div
        className={`mt-6 ${align === "center" ? "mx-auto" : ""} rule-brass`}
      />
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
