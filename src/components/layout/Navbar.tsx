"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/cohort", label: "Cohort" },
  { href: "/events", label: "Events" },
  { href: "/partnership", label: "Partner" },
  { href: "/theory-of-change", label: "Impact" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape to close + focus trap while the mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;

    const menu = menuRef.current;
    const focusables = menu?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusables?.[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // The YAN mini-site owns its own header (see src/components/yan/layout/YanNavbar.tsx)
  // so the main-site chrome doesn't stack on top of it under /yan. This check
  // runs after every hook above so hook order never changes between renders.
  if (pathname?.startsWith("/yan")) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-mist bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-md backdrop-blur-md" : "shadow-sm"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/logo.png"
            alt="Living Water Network"
            width={160}
            height={70}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`text-sm font-medium font-sans transition-colors hover:text-[#0A77BC] rounded-sm ${
                pathname === href ? "text-[#0A77BC]" : "text-slate"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/donate" className="btn-copper ml-2">
            Donate
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={toggleRef}
          className="md:hidden p-2 rounded-md text-slate hover:bg-mist transition-colors"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-mist bg-white px-4 pb-4 pt-2 space-y-1"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium font-sans transition-colors hover:bg-mist hover:text-[#0A77BC] ${
                pathname === href ? "text-[#0A77BC] bg-mist" : "text-slate"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/donate"
            onClick={() => setMobileOpen(false)}
            className="btn-copper w-full mt-2 text-center"
          >
            Donate
          </Link>
        </div>
      )}
    </header>
  );
}
