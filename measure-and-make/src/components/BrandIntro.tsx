"use client";

import { useEffect, useState } from "react";
import { assetPath } from "@/lib/asset-path";
import { home } from "@/content/copy";

/**
 * The first-load brand reveal: a Deep Forest field, the Maker's Seal, the full
 * Measure & Make lockup, then the field retracts into the homepage. It plays
 * once per browsing session, on the homepage only.
 *
 * Three decisions worth knowing before changing anything here:
 *
 * 1. The sequence is CSS (see globals.css), not script. It reaches its finished
 *    state by animation, so the overlay cannot get stuck over the page if the
 *    JavaScript fails, is slow, or is switched off. This component only decides
 *    whether to play it, holds scrolling while it plays, and removes the node.
 * 2. The overlay is in the server-rendered HTML so the Deep Forest field is
 *    part of the first paint — no flash of the homepage first, and no black
 *    frame before the field. The real page renders behind it; nothing here
 *    waits on a font, an image, an API call, or hydration, and nothing here
 *    reports progress, because there is no loading to report.
 * 3. The supplied horizontal lockup is dark ink, and the reverse lockup has not
 *    reached the repository (public/brand/INSTALLED-ASSETS.md). So the name is
 *    revealed on a Limestone plate, which is the ground the artwork is drawn
 *    for. Nothing here filters, inverts, recolours, or redraws a lockup, and
 *    the Maker's Seal is used exactly as supplied.
 *
 * The seal appears roughly 300ms before the lockup, per the founder's brief for
 * this sequence. The company is never introduced by the seal alone: the full
 * name always follows, and the plate holding it is the largest thing on screen.
 */

const SESSION_KEY = "mm-intro-seen-v1";

/** Hard ceiling. The node is removed at this point whatever else has happened. */
const FULL_SEQUENCE_MS = 2100;
const REDUCED_MOTION_MS = 220;

/**
 * Runs while the browser is still parsing this part of the document — before
 * the overlay below it is painted — so a second visit in the same session
 * never flashes a Deep Forest field. It sets the attribute the stylesheet keys
 * the whole sequence off:
 *
 *   "play" — this visit plays the reveal
 *   "seen" — already played this session; the overlay is display:none
 */
const GATE_SCRIPT = `try{document.documentElement.dataset.mmIntro=sessionStorage.getItem(${JSON.stringify(
  SESSION_KEY,
)})?"seen":"play"}catch(e){document.documentElement.dataset.mmIntro="play"}`;

export function BrandIntro() {
  const [present, setPresent] = useState(true);

  useEffect(() => {
    const root = document.documentElement;

    // Already played this session — including a client-side navigation back to
    // the homepage, which remounts this component.
    if (root.dataset.mmIntro === "seen") {
      setPresent(false);
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private browsing, or storage disabled. The reveal simply plays again
      // next time; nothing else depends on this.
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Scrolling is held only for the full sequence, and only for as long as it
    // runs. Reduced motion never waits, so it is never held.
    const previousOverflow = root.style.overflow;
    if (!reduceMotion) root.style.overflow = "hidden";

    function release() {
      root.style.overflow = previousOverflow;
      root.dataset.mmIntro = "seen";
    }

    const timer = window.setTimeout(
      () => {
        release();
        setPresent(false);
      },
      reduceMotion ? REDUCED_MOTION_MS : FULL_SEQUENCE_MS,
    );

    // Covers an unmount mid-sequence (a fast navigation away) as well as the
    // ordinary path: scrolling is always restored.
    return () => {
      window.clearTimeout(timer);
      release();
    };
  }, []);

  if (!present) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <link
        rel="preload"
        as="image"
        href={assetPath("/brand/measure-make-makers-seal.svg")}
      />
      <link
        rel="preload"
        as="image"
        href={assetPath("/brand/measure-make-03-5-horizontal.svg")}
      />

      {/* Decorative throughout: the page behind it carries the real header
          lockup, headings, and links. It is hidden from assistive technology,
          holds nothing focusable, and takes no pointer events, so it can
          neither trap focus nor swallow a click. */}
      <div className="mm-intro" aria-hidden="true">
        <div className="mm-intro__panel mm-intro__panel--top" />
        <div className="mm-intro__panel mm-intro__panel--bottom" />

        <div className="mm-intro__stage">
          {/* The seal settles on the centre, then the plate opens outward from
              behind it and the seal hands off to the full name. They share one
              optical centre so the mark resolves into the lockup instead of
              flying anywhere — and so the seal is never on screen next to the
              lockup's own copy of it. */}
          <div className="mm-intro__mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="mm-intro__seal"
              src={assetPath("/brand/measure-make-makers-seal.svg")}
              alt=""
              width={240}
              height={240}
            />

            <div className="mm-intro__plate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="mm-intro__lockup"
                src={assetPath("/brand/measure-make-03-5-horizontal.svg")}
                alt=""
                width={1125}
                height={225}
              />
            </div>
          </div>

          <span className="mm-intro__rule" />
          {/* Approved copy, from the homepage's own "why" heading. */}
          <p className="mm-intro__line">{home.why.headline}</p>
        </div>
      </div>
    </>
  );
}
