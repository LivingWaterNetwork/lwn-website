import { YanMark } from "./YanMark";

/**
 * Accessible name for the mark everywhere it appears. Nearby live text (page
 * titles, the "Atlanta" descriptor) supplies local-search context — the mark
 * itself never gets "Atlanta" baked in, per the naming hierarchy.
 */
const ACCESSIBLE_NAME = "YAN — Young Adults Network";

/** Primary lockup — horizontal, for headers and wherever width allows. */
export function YanLogoHorizontal({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span role="img" aria-label={ACCESSIBLE_NAME} className="inline-flex items-center gap-2.5">
      <YanMark variant={tone === "light" ? "white" : "navy"} size={34} />
      <span
        className={`font-yan-heading font-bold text-xl tracking-tight ${
          tone === "light" ? "text-white" : "text-yan-navy"
        }`}
      >
        YAN
      </span>
    </span>
  );
}

/** Alternate lockup — stacked, for square/vertical formats (footer, social, apparel). */
export function YanLogoStacked({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span role="img" aria-label={ACCESSIBLE_NAME} className="inline-flex flex-col items-center gap-2">
      <YanMark variant={tone === "light" ? "white" : "navy"} size={44} />
      <span
        className={`font-yan-heading font-semibold text-[11px] uppercase tracking-[0.25em] text-center leading-tight ${
          tone === "light" ? "text-white/90" : "text-yan-navy/80"
        }`}
      >
        Young Adults
        <br />
        Network
      </span>
    </span>
  );
}
