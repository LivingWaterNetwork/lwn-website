"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { YAN_CITIES } from "@/lib/yanCities";
import { track } from "@/lib/yanAnalytics";

export function CitySelector({ triggerLabel = "Find Your City" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    focusables?.[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
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
  }, [open]);

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)} className="yan-btn-secondary">
        {triggerLabel}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-yan-navy/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="yan-city-selector-title"
            className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="yan-eyebrow mb-1">Choose Your City</p>
                <h2 id="yan-city-selector-title" className="yan-h3 text-yan-navy">
                  Where are you connecting from?
                </h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-yan-navy/40 hover:text-yan-navy p-1 -mt-1 -mr-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {YAN_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/yan/${city.slug}`}
                    onClick={() => track("yan_gateway_pathway_selected", { city: city.slug })}
                    className="flex items-center justify-between gap-3 w-full text-left px-4 py-3.5 rounded-xl border border-yan-navy/10 hover:border-yan-blue hover:bg-yan-blue/5 transition-colors group"
                  >
                    <span>
                      <span className="block text-sm font-yan-heading font-semibold text-yan-navy">{city.name}</span>
                      <span className="block text-xs text-yan-navy/50 font-yan-body mt-0.5">{city.summary}</span>
                      <span
                        className={`inline-block mt-1.5 text-[10px] font-yan-heading font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          city.isFoundingHub ? "text-yan-blue bg-yan-blue/10" : "text-yan-clay bg-yan-clay/10"
                        }`}
                      >
                        {city.stageBadge}
                      </span>
                    </span>
                    <svg className="w-4 h-4 text-yan-navy/30 group-hover:text-yan-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-xs text-yan-navy/40 mt-5 text-center">
              Not in one of these cities yet?{" "}
              <Link href="/yan/join?path=updates" className="text-yan-blue font-semibold underline underline-offset-2" onClick={() => setOpen(false)}>
                Get updates
              </Link>{" "}
              when YAN expands near you.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
