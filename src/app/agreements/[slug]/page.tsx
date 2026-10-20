import type { Metadata } from "next";
import { AgreementSignerApp } from "./AgreementSignerApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Agreement",
  robots: { index: false, follow: false },
};

export default function AgreementPage({ params }: { params: { slug: string } }) {
  return <AgreementSignerApp slug={params.slug} />;
}
