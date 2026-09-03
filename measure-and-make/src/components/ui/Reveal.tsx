"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A single, quiet entrance. Anyone whose system asks for reduced motion gets the
 * content with no animation at all — not a faster version of it.
 *
 * `data-reveal` is load-bearing, not a hook for styling. The server cannot know
 * anyone's motion preference, so this always renders with framer-motion's
 * `initial` inline style — `opacity: 0` — in the server HTML. On a client that
 * asks for reduced motion the branch below then returns a plain <div> with no
 * style prop, and React does not clear an inline style it never rendered: the
 * server's `opacity: 0` stays on the element permanently and the content is
 * never seen. The rule in globals.css keyed to this attribute overrides that
 * before first paint, with no JavaScript involved.
 *
 * Nothing above the fold should use this at all — see the homepage hero, whose
 * entrance is CSS only. An entrance that needs an observer to finish does not
 * belong on content that is visible the moment the page opens.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div data-reveal className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
