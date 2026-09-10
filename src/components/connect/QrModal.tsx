"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon, DownloadIcon } from "./Icons";
import { QR_COPY, QR_FILENAME_BASE } from "@/lib/connect/omar";
import type { QrAssets } from "@/lib/connect/qr";

/**
 * Accessible QR sheet. Bottom sheet on phones, centered dialog from `sm` up.
 *
 * The QR markup and PNG data URI are generated on the server and passed in as
 * props, so opening the sheet and downloading either format works with no
 * network round trip and no loading state.
 */

type Props = {
  open: boolean;
  onClose: () => void;
  qr: QrAssets;
  /** Focus returns here on close, per the experience spec. */
  returnFocusRef: React.RefObject<HTMLElement>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function QrModal({ open, onClose, qr, returnFocusRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Move focus into the sheet on open, and restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    // Captured now rather than read in cleanup: the trigger is the same node
    // for the life of the card, and reading it here keeps the cleanup honest.
    const trigger = returnFocusRef.current;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      (trigger ?? previous)?.focus();
    };
  }, [open, returnFocusRef]);

  // Escape to close, Tab cycles within the sheet.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Hold the background still while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setDownloadError(null);
  }, [open]);

  const download = useCallback((href: string, filename: string) => {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, []);

  const downloadPng = useCallback(() => {
    try {
      setDownloadError(null);
      download(qr.pngDataUrl, `${QR_FILENAME_BASE}.png`);
    } catch {
      setDownloadError("That download didn't start. Try again.");
    }
  }, [download, qr.pngDataUrl]);

  const downloadSvg = useCallback(() => {
    let url: string | null = null;
    try {
      setDownloadError(null);
      const blob = new Blob([qr.svg], { type: "image/svg+xml;charset=utf-8" });
      url = URL.createObjectURL(blob);
      download(url, `${QR_FILENAME_BASE}.svg`);
    } catch {
      setDownloadError("That download didn't start. Try again.");
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url as string), 10_000);
    }
  }, [download, qr.svg]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-navy/60 motion-safe:animate-[fadeIn_150ms_ease-out]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-heading"
        aria-describedby="qr-modal-supporting"
        className="relative w-full max-w-sm rounded-t-3xl bg-mm-limestone-light px-6 pb-8 pt-6 shadow-2xl motion-safe:animate-[sheetUp_220ms_cubic-bezier(0.22,1,0.36,1)] sm:rounded-3xl sm:pb-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="qr-modal-heading"
              className="font-serif text-xl font-semibold text-navy"
            >
              {QR_COPY.heading}
            </h2>
            <p
              id="qr-modal-supporting"
              className="mt-1 font-sans text-sm leading-relaxed text-slate"
            >
              {QR_COPY.supporting}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR code"
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate transition hover:bg-mm-limestone-dark hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone-light"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Fixed aspect box so the sheet never reflows around the code. */}
        <div className="mx-auto mt-5 aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-mm-limestone-dark">
          <div
            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qr.svg }}
          />
        </div>

        {/* Plain-text fallback for anyone whose camera can't scan. */}
        <a
          href={qr.encoded}
          className="mt-4 block break-all rounded-lg px-2 py-1 text-center font-sans text-xs leading-relaxed text-slate underline decoration-slate/40 underline-offset-4 transition hover:decoration-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone-light"
        >
          {qr.encoded}
        </a>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={downloadPng}
            aria-label="Download QR code image as PNG"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 font-sans text-sm font-semibold text-white transition hover:bg-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone-light"
          >
            <DownloadIcon className="h-4 w-4" />
            PNG
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            aria-label="Download QR code image as SVG"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-navy/20 bg-transparent px-4 py-3 font-sans text-sm font-semibold text-navy transition hover:border-navy/40 hover:bg-mm-limestone-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone-light"
          >
            <DownloadIcon className="h-4 w-4" />
            SVG
          </button>
        </div>

        {downloadError ? (
          <p
            role="alert"
            className="mt-3 text-center font-sans text-xs text-copper-dark"
          >
            {downloadError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
