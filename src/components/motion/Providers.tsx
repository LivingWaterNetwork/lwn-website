"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Central motion setup for the whole app: gates every motion component
 * (whileInView, whileHover, imperative animate, etc.) behind the OS-level
 * prefers-reduced-motion setting via a single MotionConfig, and cross-fades
 * route changes. Wraps only <main>{children}</main> in layout.tsx — Navbar
 * and Footer stay outside so they never remount on navigation.
 */
export function MotionProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
