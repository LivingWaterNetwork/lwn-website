"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/yanAnalytics";

const PATHWAYS = [
  {
    href: "/yan/join?path=ministry-leader",
    label: "I lead a young-adult ministry or group",
    key: "ministry-leader",
  },
  {
    href: "/yan/join?path=pastor",
    label: "I am a pastor or church leader",
    key: "pastor",
  },
  {
    href: "/yan/join?path=roundtable-interest",
    label: "I want to attend the Leaders Roundtable",
    key: "roundtable-interest",
  },
  {
    href: "/yan/join?path=find-community",
    label: "I want to find a young-adult community",
    key: "find-community",
  },
  {
    href: "/yan/join?path=partner-volunteer",
    label: "I want to partner, volunteer, or share a resource",
    key: "partner-volunteer",
  },
  {
    href: "/yan/join?path=updates",
    label: "I want updates as the network launches",
    key: "updates",
  },
];

export function MovementGateway({ triggerLabel = "Enter the Network" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    track("yan_gateway_opened");
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
      <button ref={triggerRef} onClick={() => setOpen(true)} className="yan-btn-primary text-base !px-8 !py-4">
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-yan-navy/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="yan-gateway-title"
            className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-5">
              <h2 id="yan-gateway-title" className="yan-h3 text-yan-navy pr-6">
                Choose your next step
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-yan-navy/40 hover:text-yan-navy p-1 -mt-1 -mr-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {PATHWAYS.map((p) => (
                <li key={p.key}>
                  <Link
                    href={p.href}
                    onClick={() => track("yan_gateway_pathway_selected", { pathway: p.key })}
                    className="flex items-center justify-between gap-3 w-full text-left px-4 py-3.5 rounded-xl border border-yan-navy/10 hover:border-yan-blue hover:bg-yan-blue/5 transition-colors group"
                  >
                    <span className="text-sm font-yan-body font-medium text-yan-navy">{p.label}</span>
                    <svg
                      className="w-4 h-4 text-yan-navy/30 group-hover:text-yan-blue shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
