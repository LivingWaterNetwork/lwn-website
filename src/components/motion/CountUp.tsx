"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function parseStat(raw: string) {
  const match = raw.match(/^([^\d]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: "", number: null as number | null, suffix: raw, decimals: 0 };
  const [, prefix, numberStr, suffix] = match;
  const decimals = numberStr.includes(".") ? numberStr.split(".")[1].length : 0;
  return { prefix, number: parseFloat(numberStr), suffix, decimals };
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface CountUpProps {
  /** Full stat text as authored, e.g. "39%", "35%", "~2x" — animates the numeric part only. */
  value: string;
  className?: string;
  /** Milliseconds. */
  duration?: number;
}

export function CountUp({ value, className, duration = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const parsed = parseStat(value);
  const [display, setDisplay] = useState(shouldReduceMotion ? parsed.number ?? 0 : 0);

  useEffect(() => {
    if (!inView || parsed.number === null) return;

    if (shouldReduceMotion) {
      setDisplay(parsed.number);
      return;
    }

    const target = parsed.number;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(target * easeOutExpo(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (parsed.number === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {display.toFixed(parsed.decimals)}
      {parsed.suffix}
    </span>
  );
}
