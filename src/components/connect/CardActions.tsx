"use client";

import { useCallback, useRef, useState } from "react";

import {
  CheckIcon,
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  QrIcon,
  ShareIcon,
} from "./Icons";
import { QrModal } from "./QrModal";
import {
  CONTACT,
  SHARE,
  VCARD_FILENAME,
  CANONICAL_URL,
} from "@/lib/connect/omar";
import type { QrAssets } from "@/lib/connect/qr";

/**
 * The card's interactive surface: the four primary actions, the QR trigger, and
 * the QR sheet. Everything else on the page is server-rendered.
 */

const ACTION_TILE =
  "group inline-flex min-h-[44px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 font-sans text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone motion-safe:active:scale-[0.97]";

export function CardActions({ qr }: { qr: QrAssets }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrTriggerRef = useRef<HTMLButtonElement>(null);

  const share = useCallback(async () => {
    setError(null);

    // Web Share where available — the OS sheet is its own confirmation, so no
    // in-page toast on this path.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: SHARE.title,
          text: SHARE.text,
          url: CANONICAL_URL,
        });
        return;
      } catch (err) {
        // A user-cancelled share is not a failure; fall through on anything else.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(CANONICAL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the link. You can copy it from the QR sheet.");
    }
  }, []);

  const saveContact = useCallback(() => {
    setError(null);
    try {
      // The route segment is named for the file, so the download keeps its
      // filename even where Content-Disposition is ignored.
      window.location.href = `/connect/omar/${VCARD_FILENAME}`;
    } catch {
      setError("That download didn't start. Try again.");
    }
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={saveContact}
          aria-label="Save Omar Fandino's contact information"
          className={`${ACTION_TILE} bg-navy text-white shadow-sm hover:bg-navy-light hover:shadow-md focus-visible:ring-navy`}
        >
          <DownloadIcon className="h-5 w-5" />
          Save Contact
        </button>

        <a
          href={CONTACT.emailHref}
          aria-label="Email Omar Fandino"
          className={`${ACTION_TILE} border border-navy/15 bg-white text-navy shadow-sm hover:border-navy/30 hover:shadow-md focus-visible:ring-navy`}
        >
          <MailIcon className="h-5 w-5" />
          Email Omar
        </a>

        <a
          href={CONTACT.phoneHref}
          aria-label="Call Omar Fandino"
          className={`${ACTION_TILE} border border-navy/15 bg-white text-navy shadow-sm hover:border-navy/30 hover:shadow-md focus-visible:ring-navy`}
        >
          <PhoneIcon className="h-5 w-5" />
          Call
        </a>

        <button
          type="button"
          onClick={share}
          aria-label="Share this contact card"
          className={`${ACTION_TILE} border border-navy/15 bg-white text-navy shadow-sm hover:border-navy/30 hover:shadow-md focus-visible:ring-navy`}
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-copper" />
          ) : (
            <ShareIcon className="h-5 w-5" />
          )}
          {copied ? SHARE.copiedLabel : "Share"}
        </button>
      </div>

      {/* Announced politely so a screen reader hears the copy confirmation. */}
      <p aria-live="polite" className="sr-only">
        {copied ? SHARE.copiedLabel : ""}
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-center font-sans text-xs text-copper-dark">
          {error}{" "}
          <button
            type="button"
            onClick={() => setError(null)}
            className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper"
          >
            Dismiss
          </button>
        </p>
      ) : null}

      <button
        ref={qrTriggerRef}
        type="button"
        onClick={() => setQrOpen(true)}
        aria-label="Open QR code to save this contact card"
        aria-haspopup="dialog"
        aria-expanded={qrOpen}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-slate/35 bg-transparent px-4 py-3.5 font-sans text-sm font-semibold text-slate transition hover:border-slate/60 hover:bg-white/60 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-mm-limestone"
      >
        <QrIcon className="h-5 w-5" />
        Show My QR
      </button>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        qr={qr}
        returnFocusRef={qrTriggerRef}
      />
    </>
  );
}
