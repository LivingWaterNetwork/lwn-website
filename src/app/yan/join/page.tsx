import type { Metadata } from "next";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanJoinForm } from "@/components/yan/sections/YanJoinForm";

export const metadata: Metadata = {
  ...canonical("/yan/join"),
  title: "Join the Network",
  description:
    "Bring your ministry, church, or group into YAN Atlanta — or find a young-adult community, register interest in the Leaders Roundtable, or get launch updates.",
};

export default function YanJoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN Atlanta", path: "/yan" }, { name: "Join", path: "/yan/join" }])),
        }}
      />
      <section className="py-16 sm:py-24 bg-yan-navy">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Join the Network</p>
          <h1 className="yan-h1 text-white mb-4">Bring your city into the room.</h1>
          <p className="yan-body text-white/65 mb-10 max-w-xl">
            Whether you lead a ministry, pastor a church, want to find community, or simply want to
            help — there&apos;s a next step for you here.
          </p>
          <YanJoinForm />
        </div>
      </section>
    </>
  );
}
