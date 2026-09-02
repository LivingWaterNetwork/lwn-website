import { assetPath } from "@/lib/asset-path";

/**
 * The approved production lockups, used as supplied. Nothing here redraws,
 * re-fonts, or recolors them (01-BRAND-FOUNDATION.md §6).
 *
 * `horizontal` is the primary lockup and always leads. `seal` is the Maker's
 * Seal — a secondary signature that may only appear after the complete name has
 * already been established in the same layout or visit (§1).
 *
 * The supplied lockup is dark ink on transparent, so it belongs on light
 * (Limestone) grounds. The reverse lockup for dark grounds has not been supplied
 * yet — see public/brand/README-ASSETS.md. Do not fake it with a CSS filter.
 */
export function Logo({
  variant = "horizontal",
  className = "",
  priority = false,
}: {
  variant?: "horizontal" | "seal";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "seal") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={assetPath("/brand/measure-make-makers-seal.svg")}
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/brand/measure-make-03-5-horizontal.svg")}
      alt="Measure & Make"
      width={1125}
      height={225}
      loading={priority ? "eager" : "lazy"}
      className={className}
    />
  );
}
