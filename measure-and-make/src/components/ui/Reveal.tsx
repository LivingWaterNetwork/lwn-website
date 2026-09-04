import type { CSSProperties, ReactNode } from "react";

/**
 * A single, quiet entrance — in CSS, with no JavaScript involved at all.
 *
 * This used to be framer-motion `whileInView`, and that was the wrong shape for
 * a content site. It server-rendered every wrapper at `opacity: 0` and only
 * animated it up once an IntersectionObserver fired, so all of a page's
 * headings and copy were invisible until the JavaScript loaded, hydrated, and
 * the observer reported. Anything that interrupted that chain left real
 * visitors on a blank page — and even in the happy path, `margin: "-80px"`
 * held content that was plainly on screen at the bottom of the first viewport
 * at zero opacity until someone scrolled.
 *
 * Now: no observer, no scroll listener, no animation library, and no `initial`
 * inline style in the server HTML. `delay` staggers a group by passing a custom
 * property to the stylesheet.
 *
 * The one rule worth keeping in mind if you edit globals.css: the hidden state
 * lives ONLY inside the `@keyframes` `from` step, never in a static rule. If
 * the animation cannot run for any reason, the content is simply visible. That
 * is the property that makes this safe, and it is deliberately the opposite of
 * how the old version failed.
 *
 * `as` exists for one reason: a wrapper div between <ol> and its <li> breaks
 * the list. Screen readers stop announcing "list, 4 items" and stop announcing
 * each item's position, because the <li> elements are no longer children of the
 * list — which is exactly what happened here, and Lighthouse flagged it as two
 * separate failures (`list` and `listitem`). Inside a list, render the Reveal
 * AS the item: <Reveal as="li"> with a plain block inside it.
 *
 * This is a server component. Nothing here ships to the browser.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger, in seconds, to match how the old prop was called. */
  delay?: number;
  className?: string;
  /** Use "li" inside a <ul>/<ol> so the list keeps its semantics. */
  as?: "div" | "li";
}) {
  const style =
    delay > 0
      ? ({
          "--mm-reveal-delay": `${Math.round(delay * 1000)}ms`,
        } as CSSProperties)
      : undefined;

  return (
    <Tag data-reveal className={className} style={style}>
      {children}
    </Tag>
  );
}
