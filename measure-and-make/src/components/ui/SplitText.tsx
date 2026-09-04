import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * A headline that arrives as composed type: each word rises out from behind its
 * own mask, staggered, instead of a whole block fading in.
 *
 * Why words and not lines. A true line split has to measure where the browser
 * chose to break, which means reading geometry at runtime — and a geometry read
 * is the same mechanism as the entrance bug this site has already been through
 * twice (see Reveal.tsx and tests/reveal-entrance.test.ts, which ban it). Words
 * need no measurement: each one is an inline-block mask, so the browser still
 * breaks lines wherever it likes and the masks come along. The effect reads the
 * same because the masks sit on the type itself rather than around the block.
 *
 * Three properties hold this together, and all three are deliberate:
 *
 * 1. It is a server component. Nothing here ships to the browser, there is no
 *    observer, no scroll listener and no frame loop, and the entrance runs on
 *    load rather than on anything a visitor has to do first.
 * 2. The hidden state lives ONLY in the `@keyframes` `from` step in
 *    globals.css. If the animation cannot run — animations unsupported, the
 *    rule dropped, reduced motion — every word is simply at its resting
 *    position. Never move the hidden state into a static rule.
 * 3. The spaces between words are real text nodes between the masks, not
 *    padding or margin. So the accessible text is still "From scattered ideas
 *    to durable form." with ordinary word boundaries, selection and copy-paste
 *    work, and a screen reader reads a sentence rather than a word list.
 *
 * `variant` decides when it plays, because the hero is not like the rest of the
 * page: "hero" is gated on the first-load brand reveal actually playing, so a
 * later page view in the same session, a reduced-motion visitor, and a visitor
 * with JavaScript off all get the headline at full strength with no animation
 * at all. "section" plays on load, once, wherever it is on the page.
 */
export function SplitText({
  text,
  as: Tag = "span",
  variant = "section",
  className = "",
  delay = 0,
  children,
}: {
  text: string;
  /** The element to render. A heading should pass its own tag. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  variant?: "hero" | "section";
  className?: string;
  /** Extra stagger, in seconds, for a group of headings on one page. */
  delay?: number;
  /** Rendered after the words — a trailing mark that should not be masked. */
  children?: ReactNode;
}) {
  const words = text.split(/\s+/).filter(Boolean);

  const style =
    delay > 0
      ? ({
          "--mm-split-base": `${Math.round(delay * 1000)}ms`,
        } as CSSProperties)
      : undefined;

  return (
    <Tag data-mm-split={variant} className={className} style={style}>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 ? " " : null}
          <span
            className="mm-split__mask"
            style={{ "--mm-word": index } as CSSProperties}
          >
            <span className="mm-split__word">{word}</span>
          </span>
        </Fragment>
      ))}
      {children}
    </Tag>
  );
}
