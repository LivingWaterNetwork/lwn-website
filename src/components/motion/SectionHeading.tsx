"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const underline: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

interface SectionHeadingProps {
  label?: string;
  heading: string;
  subheading?: string;
  align?: "center" | "left";
  labelClassName?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  className?: string;
}

/**
 * Standard "reveal" pattern reused across sections: label underline draws in,
 * heading fades up, subheading follows. Renders the same semantics
 * (h2 + existing utility classes) as the hand-rolled version — motion only.
 */
export function SectionHeading({
  label,
  heading,
  subheading,
  align = "center",
  labelClassName = "section-label",
  headingClassName = "section-heading",
  subheadingClassName = "section-subheading",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <motion.div
      className={`${centered ? "text-center" : ""} ${className ?? ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={container}
    >
      {label && (
        <motion.div variants={fadeUp} className={`mb-3 ${centered ? "flex flex-col items-center" : ""}`}>
          <p className={labelClassName}>{label}</p>
          <motion.span
            variants={underline}
            style={{ transformOrigin: centered ? "center" : "left" }}
            className="mt-2 block h-px w-10 bg-current/60"
          />
        </motion.div>
      )}
      <motion.h2 variants={fadeUp} className={headingClassName}>
        {heading}
      </motion.h2>
      {subheading && (
        <motion.p
          variants={fadeUp}
          className={`${subheadingClassName} ${centered ? "mx-auto" : ""}`}
        >
          {subheading}
        </motion.p>
      )}
    </motion.div>
  );
}
