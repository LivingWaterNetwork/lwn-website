import Link from "next/link";

type Variant = "primary" | "secondary" | "quiet";

const styles: Record<Variant, string> = {
  primary: "bg-forest text-limestone hover:bg-forest-soft border border-forest",
  secondary:
    "bg-transparent text-forest border border-forest/25 hover:border-forest hover:bg-forest/5",
  quiet:
    "bg-transparent text-limestone border border-limestone/35 hover:border-brass hover:text-brass",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      // mm-draw-button is the site's one hover gesture — a brass rule drawing
      // in from the left along the bottom edge. It is the same gesture the text
      // links use (mm-draw), so every clickable thing on the site behaves the
      // same way. See globals.css.
      className={`mm-draw-button inline-flex items-center justify-center px-7 py-3.5 text-center font-sans text-sm font-semibold tracking-wide transition-colors duration-200 ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
