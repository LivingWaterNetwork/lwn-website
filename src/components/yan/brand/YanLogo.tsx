import Image from "next/image";
import { YanMark } from "./YanMark";

/** Official lockup artwork, as supplied — see public/images/yan/brand/. */
const LOGO_ASPECT = 1390 / 306;

/** Primary lockup — horizontal, for headers and wherever width allows. */
export function YanLogoHorizontal({ tone = "dark", height = 34 }: { tone?: "dark" | "light"; height?: number }) {
  return (
    <Image
      src={tone === "light" ? "/images/yan/brand/yan-logo-reverse.png" : "/images/yan/brand/yan-logo-primary.png"}
      alt="YAN — Young Adults Network"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      className="h-auto w-auto"
      style={{ height, width: "auto" }}
      priority
    />
  );
}

/** Alternate lockup — stacked, for square/vertical formats (footer, social). No stacked artwork was
 * supplied, so this composes the official icon mark with the wordmark text to match its style. */
export function YanLogoStacked({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span role="img" aria-label="YAN — Young Adults Network" className="inline-flex flex-col items-center gap-2">
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
