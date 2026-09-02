import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { RelationshipDisclosure } from "./RelationshipDisclosure";
import {
  CAPABILITY_LINE,
  LEGAL_LINKS,
  NAV_LINKS,
} from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-forest/10 bg-limestone-dark">
      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            {/* The supplied lockup already carries the Maker's Seal alongside
                the full name, so the seal is not repeated here as a second mark. */}
            <Logo className="h-9 w-auto" />
            <p className="mt-5 font-display text-base text-forest/80">
              {CAPABILITY_LINE}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:justify-self-end">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3 lg:grid-cols-2">
              {[...NAV_LINKS, ...LEGAL_LINKS].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-forest/70 transition-colors hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-forest/10 pt-8">
          <RelationshipDisclosure includeHostingStatement />
        </div>
      </Container>
    </footer>
  );
}
