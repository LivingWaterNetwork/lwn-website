import Link from "next/link";
import type { ReactNode } from "react";

export function YanEmptyState({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
  icon,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  icon?: ReactNode;
}) {
  return (
    <div className="yan-empty-state">
      {icon && <div className="flex justify-center mb-4 text-yan-blue">{icon}</div>}
      {eyebrow && <p className="yan-eyebrow mb-2">{eyebrow}</p>}
      {/* h2: this sits directly under each page's h1 today since there's no real
         content yet to head with its own h2 — keeps heading order sequential. */}
      <h2 className="yan-h3 text-yan-navy mb-2">{title}</h2>
      <p className="yan-body text-yan-navy/60 max-w-md mx-auto mb-6">{body}</p>
      <Link href={ctaHref} className="yan-btn-primary !bg-yan-blue">
        {ctaLabel}
      </Link>
    </div>
  );
}
