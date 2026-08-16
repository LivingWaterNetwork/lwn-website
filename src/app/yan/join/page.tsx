import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd, canonical } from "@/lib/seo";
import { YanJoinForm } from "@/components/yan/sections/YanJoinForm";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { YAN_CITIES } from "@/lib/yanCities";
import { getCityStats } from "@/lib/yanCityStats";

export const metadata: Metadata = {
  ...canonical("/yan/join"),
  title: "Join the Network",
  description:
    "Bring your ministry, church, or group into YAN — or find a young-adult community, register interest in a Leaders Roundtable, or get launch updates, city by city.",
};

export default function YanJoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "YAN", path: "/yan" }, { name: "Join", path: "/yan/join" }])),
        }}
      />
      <section className="py-16 sm:py-20 bg-yan-navy text-center">
        <FadeInSection className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">Join the Network</p>
          <h1 className="yan-h1 text-white mb-4">Bring your city into the room.</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">
            Whether you lead a ministry, pastor a church, want to find community, or simply want to
            help — there&apos;s a next step for you here.
          </p>
        </FadeInSection>
      </section>

      <section className="py-14 sm:py-20 bg-yan-stone">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-8">
            <p className="yan-eyebrow mb-3">Optional</p>
            <h2 className="yan-h3 text-yan-navy">Which city are you joining from?</h2>
          </FadeInSection>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {YAN_CITIES.map((city) => {
              const [stat] = getCityStats(city.slug, ["youngAdults"]);
              return (
                <StaggerItem key={city.slug}>
                  <Link
                    href={`/yan/join?city=${encodeURIComponent(city.name)}#start`}
                    className="block rounded-xl bg-white border border-yan-navy/10 hover:border-yan-blue hover:bg-yan-blue/5 transition-colors p-4 h-full"
                  >
                    <span className="block text-sm font-yan-heading font-semibold text-yan-navy mb-1">{city.name}</span>
                    {stat && (
                      <span className="block text-xs text-yan-navy/50 font-yan-body leading-snug">
                        {stat.value} {stat.label}
                      </span>
                    )}
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
          <p className="text-xs text-yan-navy/40 mt-5 text-center">
            Picking a city fills it into the form below — you can still change or clarify it there.
          </p>
        </div>
      </section>

      <section id="start" className="py-16 sm:py-24 bg-white">
        <FadeInSection className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <YanJoinForm />
        </FadeInSection>
      </section>
    </>
  );
}
