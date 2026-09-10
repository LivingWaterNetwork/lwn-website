/**
 * Builds the standalone static version of Omar's digital business card, the one
 * deployed to the `omar-fandino-connect` Vercel project and served at
 * https://connect.lwnetwork.org.
 *
 * Why a second build at all: the card also exists as a route in this Next.js
 * app (/connect/omar), but connect.lwnetwork.org is its own Vercel project
 * serving the card at the root. Rather than deploy the whole LWN site there, or
 * move the domain between projects (which would mean touching the Wix CNAME),
 * this emits a self-contained static site — no framework, no build step at
 * deploy time, nothing to hydrate.
 *
 * Content is NOT duplicated: every string, link and contact value is imported
 * from src/lib/connect/omar.ts, the same module the Next.js route uses. Editing
 * that one file and re-running this script updates both. Only the presentation
 * layer (the CSS below) is specific to this build.
 *
 * Run with:  npm run build:card
 * Output:    standalone-card/dist/
 */

import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  CANONICAL_URL,
  CONTACT,
  FOOTER_NOTE,
  IDENTITY,
  ORGANIZATIONS,
  QR_COPY,
  QR_FILENAME_BASE,
  SHARE,
  SOCIAL,
  VCARD_FILENAME,
  buildVCard,
} from "../src/lib/connect/omar.ts";
import { generateQrAssets } from "../src/lib/connect/qr.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "standalone-card", "dist");
const [LWN, MM] = ORGANIZATIONS;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------

// Clear generated output, but preserve a `.vercel` link directory if one is
// present: the deploy target is linked per-directory, and wiping it on every
// rebuild would silently re-expose the project to git auto-detection — which
// resolves to `lwn-website`, not `omar-fandino-connect`.
mkdirSync(DIST, { recursive: true });
for (const entry of readdirSync(DIST, { withFileTypes: true })) {
  if (entry.name === ".vercel") continue;
  rmSync(join(DIST, entry.name), { recursive: true, force: true });
}
mkdirSync(join(DIST, "assets"), { recursive: true });

// Assets are copied in, not hotlinked from www.lwnetwork.org: a card that
// depends on another site's image paths breaks silently when those paths move.
// The SVG lockup is copied byte-for-byte — it is an approved production file.
copyFileSync(
  join(ROOT, "public/images/brand/measure-make-03-5-horizontal.svg"),
  join(DIST, "assets/measure-make-horizontal.svg"),
);

// The two raster sources are far larger than they render. This page is opened
// on cellular right after a QR scan, so both are resized to what the layout
// actually asks for, at 2x for high-density screens.
//
// The headshot keeps a second, larger square crop for the social preview:
// 256px would look poor in a shared link card, and per the asset manifest the
// social image is the same source at a different crop, not a separate asset.
await sharp(join(ROOT, "public/images/omar-headshot-pro.jpg"))
  .resize(256, 256, { fit: "cover", position: "top" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(DIST, "assets/omar-headshot.jpg"));

await sharp(join(ROOT, "public/images/omar-headshot-pro.jpg"))
  .resize(640, 640, { fit: "cover", position: "top" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(DIST, "assets/omar-headshot-social.jpg"));

// Palette-quantized: the lockup is flat-ish artwork, so 256 colors is visually
// lossless here and roughly a third the size of the full-color PNG.
await sharp(join(ROOT, "public/images/logo.png"))
  .resize(280, 280, { fit: "inside" })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(join(DIST, "assets/lwn-logo.png"));

// vCard: CRLF endings, served with the RFC 6350 media type (see vercel.json).
writeFileSync(join(DIST, VCARD_FILENAME), buildVCard(), "utf8");

// QR: generated here at build time, so the page ships it as static markup and
// the downloads work with no network round trip and no third-party endpoint.
// generateQrAssets is the module the unit tests decode against, so the QR this
// build emits is the exact one those tests verify.
const { svg: qrSvg, pngDataUrl } = await generateQrAssets(CANONICAL_URL);
writeFileSync(join(DIST, `${QR_FILENAME_BASE}.svg`), qrSvg, "utf8");
writeFileSync(
  join(DIST, `${QR_FILENAME_BASE}.png`),
  Buffer.from(pngDataUrl.replace(/^data:image\/png;base64,/, ""), "base64"),
);

// Headers Vercel cannot infer from the file extension. text/vcard is the RFC
// 6350 type (text/x-vcard is the deprecated pre-standard one), and attachment
// makes the file download rather than render in the browser.
writeFileSync(
  join(DIST, "vercel.json"),
  JSON.stringify(
    {
      headers: [
        {
          source: `/${VCARD_FILENAME}`,
          headers: [
            { key: "Content-Type", value: "text/vcard; charset=utf-8" },
            { key: "Content-Disposition", value: `attachment; filename="${VCARD_FILENAME}"` },
            { key: "Cache-Control", value: "public, max-age=3600" },
          ],
        },
      ],
    },
    null,
    2,
  ),
);

// ---------------------------------------------------------------------------

const icon = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

const ICONS = {
  download: icon('<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>'),
  mail: icon('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 7.2 5.4a2 2 0 0 0 2.6 0L20.5 7"/>'),
  phone: icon('<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>'),
  share: icon('<circle cx="17.5" cy="5.5" r="2.75"/><circle cx="6.5" cy="12" r="2.75"/><circle cx="17.5" cy="18.5" r="2.75"/><path d="m9 10.7 6-3.4M9 13.3l6 3.4"/>'),
  check: icon('<path d="m4.5 12.5 5 5 10-11"/>'),
  linkedin: icon('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10.5V17"/><path d="M7.5 7.4v.1"/><path d="M11.5 17v-3.6a2.9 2.9 0 0 1 5.8 0V17"/><path d="M11.5 10.5V17"/>'),
  qr: icon('<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18z"/>'),
  arrow: icon('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
  close: icon('<path d="m6 6 12 12M18 6 6 18"/>'),
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: IDENTITY.name,
  jobTitle: "Founder",
  url: CANONICAL_URL,
  image: `${CANONICAL_URL}/assets/omar-headshot-social.jpg`,
  email: CONTACT.email,
  telephone: "+14704759123",
  address: { "@type": "PostalAddress", addressLocality: "Atlanta", addressRegion: "GA", addressCountry: "US" },
  worksFor: [
    { "@type": "Organization", name: LWN.name, url: LWN.url },
    { "@type": "Organization", name: MM.name, url: MM.url },
  ],
  sameAs: [CONTACT.linkedin],
};

/**
 * Palette notes, carried over from the Next.js build:
 *  - Limestone #F2EEE4 is the neutral ground; brand color appears only inside
 *    each organization's own card, never in shared chrome.
 *  - #586661 and #7E5D2B are Measure & Make's own contrast-corrected tints;
 *    the brand's Field Gray #65756F measures 4.19:1 on Limestone and fails AA.
 *  - #a34a0e rather than LWN copper #C05A12: white on copper is 4.46:1, just
 *    under AA at this size.
 */
const css = `
:root{--navy:#0A2A47;--navy-light:#0D3459;--slate:#445563;--copper:#a34a0e;--copper-hover:#C05A12;
--forest:#12332D;--forest-soft:#1B453D;--limestone:#F2EEE4;--limestone-light:#F8F6EF;--limestone-dark:#E5DFD0;--field:#586661}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--limestone);color:var(--navy);
font-family:"Hanken Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif;
font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
.serif{font-family:Newsreader,Georgia,"Times New Roman",serif}
.wrap{max-width:30rem;margin:0 auto;padding:40px 20px}
@media(min-width:640px){.wrap{padding:56px 24px}}
.hero{display:flex;flex-direction:column;align-items:center;text-align:center}
.avatar{width:112px;height:112px;border-radius:50%;object-fit:cover;object-position:top;
box-shadow:0 0 0 1px rgba(10,42,71,.1);background:var(--limestone-dark)}
@media(min-width:640px){.avatar{width:128px;height:128px}}
h1{font-family:Newsreader,Georgia,serif;font-size:1.75rem;font-weight:600;line-height:1.15;margin:20px 0 0}
@media(min-width:640px){h1{font-size:1.875rem}}
.identity{margin:8px 0 0;max-width:22rem;font-size:.875rem;line-height:1.6;color:var(--slate)}
.location{margin:8px 0 0;font-size:.75rem;text-transform:uppercase;letter-spacing:.15em;color:var(--slate)}
.actions{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:32px}
@media(min-width:640px){.actions{grid-template-columns:repeat(4,1fr)}}
.tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
min-height:44px;padding:16px 12px;border-radius:16px;border:1px solid rgba(10,42,71,.15);
background:#fff;color:var(--navy);font:600 .875rem/1.2 inherit;text-decoration:none;cursor:pointer;
box-shadow:0 1px 2px rgba(10,42,71,.06);transition:border-color .2s,box-shadow .2s,transform .2s,background-color .2s}
.tile svg{width:20px;height:20px}
.tile:hover{border-color:rgba(10,42,71,.3);box-shadow:0 4px 10px rgba(10,42,71,.1)}
.tile.primary{background:var(--navy);border-color:var(--navy);color:#fff}
.tile.primary:hover{background:var(--navy-light)}
.tile .copied{color:var(--copper-hover)}
.qr-trigger{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:44px;
margin-top:12px;padding:14px 16px;border-radius:16px;border:1px dashed rgba(68,85,99,.35);
background:transparent;color:var(--slate);font:600 .875rem/1.2 inherit;cursor:pointer;transition:all .2s}
.qr-trigger svg{width:20px;height:20px}
.qr-trigger:hover{border-color:rgba(68,85,99,.6);background:rgba(255,255,255,.6);color:var(--navy)}
.orgs{margin-top:40px}
.eyebrow{text-align:center;font-size:.75rem;font-weight:800;text-transform:uppercase;
letter-spacing:.15em;color:var(--slate);margin:0 0 16px}
.org{border-radius:16px;padding:24px;box-shadow:0 1px 2px rgba(10,42,71,.06);margin-bottom:16px}
.org-lwn{background:#fff;border:1px solid rgba(10,42,71,.1)}
.org-mm{background:var(--limestone-light);border:1px solid rgba(18,51,45,.15)}
.org-logo{display:flex;align-items:center;justify-content:center}
.org-logo img{display:block;height:auto}
.org p{margin:16px 0 0;text-align:center}
.org-lwn p{font-family:Newsreader,Georgia,serif;font-size:1rem;line-height:1.6;color:var(--navy)}
.org-mm p{font-size:.875rem;line-height:1.6;color:var(--field)}
.org-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;
margin-top:20px;padding:12px 24px;border-radius:6px;color:#fff;font:600 .875rem/1.2 inherit;
letter-spacing:.025em;text-decoration:none;transition:background-color .2s,box-shadow .2s,transform .2s}
.org-cta svg{width:16px;height:16px}
.cta-lwn{background:var(--copper)}
.cta-lwn:hover{background:var(--copper-hover)}
.cta-mm{background:var(--forest)}
.cta-mm:hover{background:var(--forest-soft)}
.linkedin{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:44px;
margin-top:24px;padding:14px 16px;border-radius:16px;border:1px solid rgba(10,42,71,.15);
background:#fff;color:var(--navy);font:600 .875rem/1.2 inherit;text-decoration:none;
box-shadow:0 1px 2px rgba(10,42,71,.06);transition:all .2s}
.linkedin svg{width:20px;height:20px}
.linkedin:hover{border-color:rgba(10,42,71,.3);box-shadow:0 4px 10px rgba(10,42,71,.1)}
footer{margin-top:48px;padding-top:24px;border-top:1px solid rgba(10,42,71,.1);text-align:center}
footer .name{font-family:Newsreader,Georgia,serif;font-size:1rem;margin:0}
footer .note{margin:6px auto 0;max-width:20rem;font-size:.75rem;line-height:1.6;color:var(--slate)}
/* Language toggle: deliberately quiet and below the fold, so it never reads as
   a fifth primary action. Still a 44px target. */
.lang{display:inline-flex;align-items:center;justify-content:center;min-height:44px;
margin-top:4px;padding:10px 14px;border-radius:10px;font-size:.75rem;color:var(--slate);
text-decoration:underline;text-underline-offset:4px;text-decoration-color:rgba(68,85,99,.35);
transition:color .2s,text-decoration-color .2s}
.lang:hover{color:var(--navy);text-decoration-color:var(--navy)}
[hidden]{display:none!important}
.backdrop{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;
background:rgba(10,42,71,.6);animation:fade .15s ease-out}
@media(min-width:640px){.backdrop{align-items:center}}
.sheet{position:relative;width:100%;max-width:24rem;background:var(--limestone-light);
border-radius:24px 24px 0 0;padding:24px 24px 32px;box-shadow:0 -8px 40px rgba(10,42,71,.25);
animation:up .22s cubic-bezier(.22,1,.36,1)}
@media(min-width:640px){.sheet{border-radius:24px;padding-bottom:28px}}
.sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.sheet h2{font-family:Newsreader,Georgia,serif;font-size:1.25rem;font-weight:600;margin:0}
.sheet .sub{margin:4px 0 0;font-size:.875rem;line-height:1.6;color:var(--slate)}
.sheet-close{flex:0 0 auto;width:44px;height:44px;margin:-4px -8px 0 0;display:flex;align-items:center;
justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--slate);cursor:pointer;transition:all .2s}
.sheet-close svg{width:20px;height:20px}
.sheet-close:hover{background:var(--limestone-dark);color:var(--navy)}
.qr-frame{width:100%;max-width:260px;aspect-ratio:1;margin:20px auto 0;padding:12px;background:#fff;
border-radius:16px;box-shadow:0 0 0 1px var(--limestone-dark),0 1px 2px rgba(10,42,71,.06)}
.qr-frame svg{display:block;width:100%;height:100%}
.qr-url{display:block;margin-top:16px;padding:4px 8px;text-align:center;font-size:.75rem;line-height:1.6;
word-break:break-all;color:var(--slate);text-decoration:underline;text-underline-offset:4px;
text-decoration-color:rgba(68,85,99,.4);border-radius:8px}
.qr-url:hover{text-decoration-color:var(--navy)}
.qr-dl{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.qr-dl a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:12px 16px;
border-radius:12px;font:600 .875rem/1.2 inherit;text-decoration:none;transition:all .2s}
.qr-dl svg{width:16px;height:16px}
.dl-png{background:var(--navy);color:#fff}
.dl-png:hover{background:var(--navy-light)}
.dl-svg{border:1px solid rgba(10,42,71,.2);color:var(--navy)}
.dl-svg:hover{border-color:rgba(10,42,71,.4);background:var(--limestone-dark)}
:focus-visible{outline:2px solid var(--navy);outline-offset:2px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;
animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;

const js = `
(function(){
  "use strict";
  var CANONICAL=${JSON.stringify(CANONICAL_URL)};
  var SHARE_TITLE=${JSON.stringify(SHARE.title)},SHARE_TEXT=${JSON.stringify(SHARE.text)};
  var $=function(id){return document.getElementById(id)};

  // Share: the OS sheet is its own confirmation, so no toast on that path.
  // Clipboard is the automatic fallback where navigator.share is absent.
  var shareBtn=$("share"),shareLabel=$("share-label"),shareIcon=$("share-icon"),live=$("live");
  shareBtn.addEventListener("click",function(){
    if(navigator.share){
      navigator.share({title:SHARE_TITLE,text:SHARE_TEXT,url:CANONICAL}).catch(function(e){
        if(e&&e.name==="AbortError")return;
        copyLink();
      });
      return;
    }
    copyLink();
  });
  function copyLink(){
    var done=function(){
      shareLabel.textContent=${JSON.stringify(SHARE.copiedLabel)};
      shareIcon.classList.add("copied");
      live.textContent=${JSON.stringify(SHARE.copiedLabel)};
      setTimeout(function(){shareLabel.textContent="Share";shareIcon.classList.remove("copied");live.textContent=""},2000);
    };
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(CANONICAL).then(done,fallbackCopy);
    }else{fallbackCopy()}
    function fallbackCopy(){
      try{
        var t=document.createElement("textarea");
        t.value=CANONICAL;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";
        document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();done();
      }catch(err){live.textContent="Couldn't copy the link."}
    }
  }

  // QR sheet: focus moves in on open, is trapped while open, and returns to the
  // trigger on close. Escape and the close control both dismiss it.
  var sheet=$("qr-sheet"),trigger=$("qr-trigger"),panel=$("qr-panel");
  var SEL='a[href], button:not([disabled])';
  function open(){
    sheet.hidden=false;trigger.setAttribute("aria-expanded","true");
    document.body.style.overflow="hidden";
    var f=panel.querySelectorAll(SEL);if(f.length)f[0].focus();
    document.addEventListener("keydown",onKey);
  }
  function close(){
    sheet.hidden=true;trigger.setAttribute("aria-expanded","false");
    document.body.style.overflow="";
    document.removeEventListener("keydown",onKey);
    trigger.focus();
  }
  function onKey(e){
    if(e.key==="Escape"){e.preventDefault();close();return}
    if(e.key!=="Tab")return;
    var f=panel.querySelectorAll(SEL);if(!f.length)return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
  trigger.addEventListener("click",open);
  $("qr-close").addEventListener("click",close);
  sheet.addEventListener("click",function(e){if(e.target===sheet)close()});
})();
`;

function renderPage(L) {
  return `<!DOCTYPE html>
<html lang="${L.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.social.title)}</title>
<meta name="description" content="${esc(L.social.description)}">
<link rel="canonical" href="${esc(L.pageUrl)}">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(L.social.title)}">
<meta property="og:description" content="${esc(L.social.description)}">
<meta property="og:url" content="${esc(L.pageUrl)}">
<meta property="og:image" content="${esc(CANONICAL_URL)}/assets/omar-headshot-social.jpg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(L.social.title)}">
<meta name="twitter:description" content="${esc(L.social.description)}">
<meta name="twitter:image" content="${esc(CANONICAL_URL)}/assets/omar-headshot-social.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap">
<style>${css}</style>
${L.alt ? `<link rel="alternate" hreflang="en" href="${esc(CANONICAL_URL)}">
<link rel="alternate" hreflang="es" href="${esc(CANONICAL_URL)}/es">
<link rel="alternate" hreflang="x-default" href="${esc(CANONICAL_URL)}">
` : ""}<script type="application/ld+json">${JSON.stringify(personJsonLd)}</script>
</head>
<body>
<main class="wrap">

  <header class="hero">
    <img class="avatar" src="./assets/omar-headshot.jpg" width="128" height="128" alt="${esc(L.headshotAlt)}" fetchpriority="high">
    <h1>${esc(IDENTITY.name)}</h1>
    <p class="identity">${esc(L.identityLine)}</p>
    <p class="location">${esc(L.location)}</p>
  </header>

  <section aria-label="Contact actions">
    <div class="actions">
      <a class="tile primary" href="./${VCARD_FILENAME}" download="${VCARD_FILENAME}" aria-label="${esc(L.a11y.save)}">${ICONS.download}${esc(L.actions.save)}</a>
      <a class="tile" href="${esc(CONTACT.emailHref)}" aria-label="${esc(L.a11y.email)}">${ICONS.mail}${esc(L.actions.email)}</a>
      <a class="tile" href="${esc(CONTACT.phoneHref)}" aria-label="${esc(L.a11y.call)}">${ICONS.phone}${esc(L.actions.call)}</a>
      <button class="tile" type="button" id="share" aria-label="${esc(L.a11y.share)}"><span id="share-icon">${ICONS.share}</span><span id="share-label">${esc(L.actions.share)}</span></button>
    </div>
    <p class="sr-only" aria-live="polite" id="live"></p>
    <button class="qr-trigger" type="button" id="qr-trigger" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(L.a11y.qrOpen)}">${ICONS.qr}${esc(L.actions.qr)}</button>
  </section>

  <section class="orgs" aria-label="Organizations">
    <h2 class="eyebrow">${esc(L.eyebrow)}</h2>

    <article class="org org-lwn">
      <div class="org-logo"><img src="./assets/lwn-logo.png" width="140" height="140" alt="${esc(LWN.logoAlt)}"></div>
      <p>${esc(L.lwn.descriptor)}</p>
      <a class="org-cta cta-lwn" href="${esc(LWN.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(L.lwn.ctaAriaLabel)}">${esc(L.lwn.cta)}${ICONS.arrow}</a>
    </article>

    <!-- The approved horizontal lockup, unmodified. Dark ink by design, so it
         only ever sits on this light ground; never filtered or inverted, and
         the name is never abbreviated. -->
    <article class="org org-mm">
      <div class="org-logo"><img src="./assets/measure-make-horizontal.svg" width="220" height="44" alt="${esc(MM.logoAlt)}"></div>
      <p>${esc(L.mm.descriptor)}</p>
      <a class="org-cta cta-mm" href="${esc(MM.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(L.mm.ctaAriaLabel)}">${esc(L.mm.cta)}${ICONS.arrow}</a>
    </article>
  </section>

  <a class="linkedin" href="${esc(CONTACT.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(L.a11y.linkedin)}">${ICONS.linkedin}${esc(L.actions.linkedin)}</a>

  <footer>
    <p class="name">${esc(IDENTITY.name)}</p>
    <p class="note">${esc(L.footerNote)}</p>
${L.alt ? `    <a class="lang" href="${L.alt.href}" hreflang="${L.alt.lang}" lang="${L.alt.lang}">${esc(L.alt.label)}</a>
` : ""}  </footer>
</main>

<div class="backdrop" id="qr-sheet" hidden>
  <div class="sheet" id="qr-panel" role="dialog" aria-modal="true" aria-labelledby="qr-h" aria-describedby="qr-s">
    <div class="sheet-head">
      <div>
        <h2 id="qr-h">${esc(L.qr.heading)}</h2>
        <p class="sub" id="qr-s">${esc(L.qr.supporting)}</p>
      </div>
      <button class="sheet-close" type="button" id="qr-close" aria-label="${esc(L.a11y.qrClose)}">${ICONS.close}</button>
    </div>
    <div class="qr-frame">${qrSvg}</div>
    <a class="qr-url" href="${esc(CANONICAL_URL)}">${esc(CANONICAL_URL)}</a>
    <div class="qr-dl">
      <a class="dl-png" href="./${QR_FILENAME_BASE}.png" download="${QR_FILENAME_BASE}.png" aria-label="${esc(L.a11y.qrPng)}">${ICONS.download}PNG</a>
      <a class="dl-svg" href="./${QR_FILENAME_BASE}.svg" download="${QR_FILENAME_BASE}.svg" aria-label="${esc(L.a11y.qrSvg)}">${ICONS.download}SVG</a>
    </div>
  </div>
</div>

<script>${js}</script>
</body>
</html>
`;
}

/**
 * Locale bundles. Everything language-independent — phone, email, both
 * organization URLs, the vCard, the QR payload — stays in omar.ts and is shared
 * by every locale; only the visible copy varies here.
 *
 * `en` is the approved English copy from 01-approved-content.md, unchanged.
 */
const EN = {
  lang: "en",
  pageUrl: CANONICAL_URL,
  identityLine: IDENTITY.identityLine,
  location: IDENTITY.location,
  headshotAlt: IDENTITY.headshotAlt,
  eyebrow: "Where I serve",
  social: SOCIAL,
  qr: QR_COPY,
  footerNote: FOOTER_NOTE,
  actions: {
    save: "Save Contact",
    email: "Email Omar",
    call: "Call",
    share: "Share",
    qr: "Show My QR",
    linkedin: "Connect on LinkedIn",
  },
  a11y: {
    save: "Save Omar Fandino's contact information",
    email: "Email Omar Fandino",
    call: "Call Omar Fandino",
    share: "Share this contact card",
    qrOpen: "Open QR code to save this contact card",
    qrClose: "Close QR code",
    qrPng: "Download QR code image as PNG",
    qrSvg: "Download QR code image as SVG",
    linkedin: "View Omar Fandino's LinkedIn profile",
  },
  lwn: { descriptor: LWN.descriptor, cta: LWN.cta, ctaAriaLabel: LWN.ctaAriaLabel },
  mm: { descriptor: MM.descriptor, cta: MM.cta, ctaAriaLabel: MM.ctaAriaLabel },
  // Counterpart locale for the language toggle, or null when none exists.
  //
  // NULL DELIBERATELY. The Spanish card is not built: its approved copy
  // (omar-digital-card-handoff/10-spanish-version-addendum.md) has not been
  // supplied, and the strings must not be improvised. Rendering a toggle to a
  // /es that does not exist would put a broken link on a live card, so both the
  // toggle and the hreflang tags stay out until the ES bundle below is filled
  // in. Set this to ES_ALT once /es ships.
  alt: null,
};

writeFileSync(join(DIST, "index.html"), renderPage(EN), "utf8");

console.log(`Built standalone card -> ${DIST}`);
console.log(`  canonical / QR payload: ${CANONICAL_URL}`);
