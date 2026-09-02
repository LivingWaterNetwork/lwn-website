import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { CtaLink } from "@/components/ui/CtaLink";
import { CTA, NAV_LINKS } from "@/content/site";

/**
 * The full-name lockup leads every page, at the top, before any other brand
 * element (01-BRAND-FOUNDATION.md §1). The header sits on a Limestone ground so
 * the supplied dark-ink lockup renders exactly as drawn.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-forest/10 bg-limestone-light">
      <Container className="flex items-center justify-between gap-8 py-5">
        <Link href="/" aria-label="Measure & Make — home" className="shrink-0">
          <Logo priority className="h-9 w-auto sm:h-10" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-sm font-medium text-forest/80 transition-colors hover:text-forest"
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

        {/* Compact navigation for narrow viewports: the same links, no JS. */}
        <nav aria-label="Primary" className="lg:hidden">
          <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1">
            {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-xs font-medium uppercase tracking-wide text-forest/75 transition-colors hover:text-forest"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
