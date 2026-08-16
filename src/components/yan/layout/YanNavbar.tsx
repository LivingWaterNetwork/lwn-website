"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { YanLogoHorizontal } from "@/components/yan/brand/YanLogo";
import { YAN_CITIES, getYanCity } from "@/lib/yanCities";

const navLinks = [
  { href: "/yan/network", label: "Network" },
  { href: "/yan/events", label: "Events" },
  { href: "/yan/leaders", label: "Leaders" },
  { href: "/yan/pray", label: "Pray" },
  { href: "/yan/resources", label: "Resources" },
  { href: "/yan/stories", label: "Stories" },
];

export function YanNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentCitySlug = pathname?.match(/^\/yan\/([^/]+)/)?.[1];
  const currentCity = currentCitySlug ? getYanCity(currentCitySlug) : undefined;
  // The Network/Events/Leaders/Pray/Resources/Stories directory is Atlanta's only —
  // hide it on not-yet-launched city hubs so it never reads as "New York's events".
  const showDirectoryLinks = !currentCity || currentCity.status === "live";
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const menu = menuRef.current;
    const focusables = menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
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

  return (
    <header className="sticky top-0 z-50 bg-yan-navy/95 backdrop-blur border-b border-white/10">
      {/* Utility strip: affiliation + return path, kept small and secondary */}
      <div className="hidden sm:flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 text-[11px] font-yan-body text-white/45">
        <span>An initiative of Living Water Network</span>
        <div className="flex items-center gap-4">
          <details className="relative group">
            <summary className="list-none cursor-pointer hover:text-white/80 transition-colors flex items-center gap-1 [&::-webkit-details-marker]:hidden">
              {currentCity ? currentCity.name : "Choose a city"}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white shadow-xl overflow-hidden z-50">
              {YAN_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/yan/${city.slug}`}
                  className={`block px-4 py-2.5 text-xs font-yan-body ${
                    city.slug === currentCitySlug ? "bg-yan-blue/10 text-yan-blue font-semibold" : "text-yan-navy hover:bg-yan-stone"
                  }`}
                >
                  {city.name}
                  {city.status === "launching-soon" && <span className="text-yan-navy/40"> — launching soon</span>}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/" className="hover:text-white/80 transition-colors">
            &larr; lwnetwork.org
          </Link>
        </div>
      </div>

      <nav
        aria-label="YAN"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-t border-white/5"
      >
        <Link href="/yan" className="shrink-0" aria-label="YAN home">
          <YanLogoHorizontal tone="light" />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {showDirectoryLinks &&
            navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`text-sm font-yan-body font-medium transition-colors hover:text-white ${
                  pathname === href ? "text-white" : "text-white/65"
                }`}
              >
                {label}
              </Link>
            ))}
          <Link href="/yan/join" className="yan-btn-primary ml-2 !py-2.5 !px-5 text-xs">
            Join the Network
          </Link>
        </div>

        <button
          ref={toggleRef}
          className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="yan-mobile-menu"
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

      {mobileOpen && (
        <div
          id="yan-mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="YAN navigation"
          className="lg:hidden border-t border-white/10 bg-yan-navy px-4 pb-4 pt-2 space-y-1"
        >
          {showDirectoryLinks &&
            navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-yan-body font-medium transition-colors hover:bg-white/10 ${
                  pathname === href ? "text-white bg-white/10" : "text-white/70"
                }`}
              >
                {label}
              </Link>
            ))}
          <Link href="/yan/join" onClick={() => setMobileOpen(false)} className="yan-btn-primary w-full mt-2">
            Join the Network
          </Link>

          <p className="px-3 pt-4 pb-1 text-[11px] font-yan-heading font-bold uppercase tracking-wide text-white/40">Cities</p>
          {YAN_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/yan/${c.slug}`}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-yan-body transition-colors hover:bg-white/10 ${
                c.slug === currentCitySlug ? "text-white bg-white/10 font-semibold" : "text-white/70"
              }`}
            >
              {c.name}
            </Link>
          ))}

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 mt-2 text-xs text-white/45 hover:text-white/70"
          >
            &larr; Back to lwnetwork.org
          </Link>
        </div>
      )}
    </header>
  );
}
