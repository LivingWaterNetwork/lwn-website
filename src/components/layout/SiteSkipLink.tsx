"use client";

import { usePathname } from "next/navigation";

/** Main-site skip link. The YAN mini-site renders its own (see yan/layout.tsx's yan-skip-link)
 * targeting its own <main id="yan-main-content">, so this one stays out of the way under /yan. */
export function SiteSkipLink() {
  const pathname = usePathname();
  if (pathname?.startsWith("/yan")) return null;

  return (
    <a href="#main-content" className="skip-link">
      Skip to content
    </a>
  );
}
