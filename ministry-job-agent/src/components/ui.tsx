import Link from "next/link";
import type { ReactNode } from "react";

const CLASSIFICATION_STYLES: Record<string, string> = {
  PRIORITY: "bg-teal-600/10 text-teal-700 ring-teal-600/25 dark:text-teal-300",
  STRONG: "bg-blue-600/10 text-blue-700 ring-blue-600/25 dark:text-blue-300",
  REVIEW: "bg-amber-600/10 text-amber-700 ring-amber-600/25 dark:text-amber-300",
  PASS: "bg-gray-500/10 text-gray-600 ring-gray-500/25 dark:text-gray-400",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  const style =
    CLASSIFICATION_STYLES[tone] ??
    (tone === "danger"
      ? "bg-red-600/10 text-red-700 ring-red-600/25 dark:text-red-300"
      : "bg-black/[0.05] text-current ring-black/10 dark:bg-white/10 dark:ring-white/15");
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${style}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="hairline mb-6 flex items-start justify-between gap-6 border-b pb-5">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="muted mt-1 max-w-2xl text-[13px] leading-relaxed">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function Stat({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  href?: string;
  tone?: "danger" | "default";
}) {
  const inner = (
    <div className="card transition-colors hover:border-black/20 dark:hover:border-white/25">
      <div className="label">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${tone === "danger" ? "text-red-600 dark:text-red-400" : ""}`}>
        {value}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

/** Renders a value that may genuinely be absent, without ever faking one. */
export function Value({ children }: { children: ReactNode }) {
  const empty =
    children == null || children === "" || (typeof children === "string" && children.trim() === "");
  if (empty) return <span className="muted italic">NOT PROVIDED</span>;
  return <>{children}</>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="hairline rounded-lg border border-dashed p-10 text-center">
      <div className="text-[14px] font-medium">{title}</div>
      {hint ? <div className="muted mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed">{hint}</div> : null}
    </div>
  );
}

export function ScoreBar({ awarded, max }: { awarded: number; max: number }) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (awarded / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/10">
      <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${pct}%` }} />
    </div>
  );
}
