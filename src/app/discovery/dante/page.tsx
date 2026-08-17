import type { Metadata } from "next";
import { DanteDiscoveryContent } from "@/components/sections/DanteDiscoveryContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Stewardship Discovery",
  robots: { index: false, follow: false },
};

export default function DanteDiscoveryPage() {
  return <DanteDiscoveryContent />;
}
