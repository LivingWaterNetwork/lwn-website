"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SESSION_KEY = "lwn-welcome-globe-2026";

export function NetworkWelcome() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dismiss = () => { setVisible(false); document.documentElement.classList.remove("lwn-intro-active"); };
    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === "seen"; sessionStorage.setItem(SESSION_KEY, "seen"); } catch { /* The introduction also works when storage is unavailable. */ }
    if (seen || reduced.matches) { dismiss(); return; }
    document.documentElement.classList.add("lwn-intro-active");
    const timer = window.setTimeout(dismiss, 4100);
    window.addEventListener("keydown", dismiss, { once: true });
    reduced.addEventListener("change", dismiss);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", dismiss); reduced.removeEventListener("change", dismiss); document.documentElement.classList.remove("lwn-intro-active"); };
  }, []);
  if (!visible) return null;
  return (
    <>
      <noscript><style>{".network-entry{display:none!important}"}</style></noscript>
      <div className="network-entry">
        <div className="network-entry-orbit" aria-hidden="true" />
        <div className="network-entry-identity" aria-hidden="true">
          <div className="network-entry-logo">
            <div className="network-logo-globe"><Image src="/images/brand/lwn-globe.webp" alt="" width={240} height={240} priority /></div>
            <div className="network-logo-water"><Image src="/images/brand/lwn-globe.webp" alt="" width={240} height={240} priority /></div>
          </div>
          <div className="network-entry-wordmark"><span>Living Water</span><span>Network</span></div>
        </div>
        <div className="network-entry-greeting" aria-hidden="true">
          <p className="network-entry-eyebrow">Living Water Network</p>
          <p className="network-entry-title">Welcome to the Network.</p>
          <p className="network-entry-tagline">Rooted in truth. Sent to lead.</p>
        </div>
        <button type="button" className="network-entry-skip" onClick={() => setVisible(false)}>Skip introduction <span aria-hidden="true">→</span></button>
      </div>
    </>
  );
}
