"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { CtaLink } from "@/components/ui/CtaLink";
import { CTA, NAV_LINKS } from "@/content/site";

/**
 * The full-name lockup leads every page, before any other brand element
 * (01-BRAND-FOUNDATION.md §1), on a Limestone ground so the supplied dark-ink
 * lockup renders exactly as drawn.
 *
 * Below the large breakpoint the links collapse into a disclosure menu: a real
 * button with aria-expanded and aria-controls, closed by Escape, and closed on
 * navigation. The links are ordinary anchors, so they work before hydration.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function isCurrent(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="border-b border-forest/10 bg-limestone-light">
      <Container className="flex items-center justify-between gap-6 py-4 sm:py-5">
        <Link
          href="/"
          aria-label="Measure & Make — home"
          className="shrink-0 py-1"
        >
          <Logo priority className="h-8 w-auto sm:h-9 lg:h-10" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={`font-sans text-sm font-medium transition-colors hover:text-forest ${
                    isCurrent(link.href)
                      ? "text-forest underline decoration-brass decoration-2 underline-offset-8"
                      : "text-forest/75"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 lg:block">
          <CtaLink href={CTA.primary.href} variant="secondary">
            {CTA.primary.label}
          </CtaLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="inline-flex items-center gap-2.5 border border-forest/25 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-eyebrow text-forest transition-colors hover:border-forest lg:hidden"
        >
          <span
            aria-hidden="true"
            className="flex h-3 w-4 flex-col justify-between"
          >
            <span className="block h-px w-full bg-forest" />
            <span className="block h-px w-full bg-forest" />
            <span className="block h-px w-full bg-forest" />
          </span>
          {open ? "Close" : "Menu"}
        </button>
      </Container>

      <div
        id="site-menu"
        hidden={!open}
        className="border-t border-forest/10 bg-limestone-light lg:hidden"
      >
        <Container className="py-4">
          <nav aria-label="Primary">
            <ul className="divide-y divide-forest/10">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    className={`block py-3.5 font-sans text-base transition-colors hover:text-brass-dark ${
                      isCurrent(link.href)
                        ? "font-semibold text-forest"
                        : "text-forest/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="pt-5">
            <CtaLink href={CTA.primary.href} className="w-full">
              {CTA.primary.label}
            </CtaLink>
          </div>
        </Container>
      </div>
    </header>
  );
}
