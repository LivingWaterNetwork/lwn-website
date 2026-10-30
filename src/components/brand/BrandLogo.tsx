import Image from "next/image";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`lwn-brand${inverse ? " lwn-brand-inverse" : ""}`} role="img" aria-label="Living Water Network">
      <Image src="/images/brand/lwn-globe.webp" alt="" width={64} height={64} className="lwn-brand-symbol" priority />
      <span className="lwn-brand-type" aria-hidden="true"><span>Living Water</span><span>Network</span></span>
    </span>
  );
}
