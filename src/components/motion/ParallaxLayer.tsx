"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  /** Fraction of scroll distance the layer travels; higher = more drift. */
  speed?: number;
}

/**
 * Wrap a background layer inside a relatively-positioned section with this
 * to have it drift at a different speed than foreground content as the
 * section scrolls through the viewport (depth-of-field parallax).
 */
export function ParallaxLayer({ children, className, speed = 0.3 }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
