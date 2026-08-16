import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { canonical } from "@/lib/seo";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { MovementGateway } from "@/components/yan/gateway/MovementGateway";
import { CitySelector } from "@/components/yan/gateway/CitySelector";
import { YanSubscribeForm } from "@/components/yan/sections/YanSubscribeForm";
import { ConnectIcon, CollaborateIcon, PrayIcon, ImpactIcon } from "@/components/yan/icons/PillarIcons";
import { YanFaithAnchor } from "@/components/yan/sections/YanFaithAnchor";
import { YAN_CITIES } from "@/lib/yanCities";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

export const metadata: Metadata = {
  ...canonical("/yan"),
  title: "YAN | Young Adults Network",
  description:
    "YAN connects the young-adult ministries, groups, pastors, and leaders already serving cities across the country into one shared mission — a movement, not a program. Founding hub: Atlanta.",
  openGraph: {
    title: "YAN | Young Adults Network",
    description: "A network for what God is already doing — city by city, starting in Atlanta.",
    type: "website",
    images: [{ url: "/images/yan/source/national-usa-night-lights-nasa.jpg", width: 1200, height: 630, alt: "United States at night, city lights connected across the country" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAN | Young Adults Network",
    description: "A network for what God is already doing — city by city.",
  },
};

const PILLARS = [
  {
    key: "connect",
    Icon: ConnectIcon,
    title: "Connect",
    body: "Building trusted relationships across ministries, groups, churches, and leaders.",
  },
  {
    key: "collaborate",
    Icon: CollaborateIcon,
    title: "Collaborate",
    body: "Sharing resources, vision, opportunities, wisdom, and support.",
  },
  {
    key: "pray",
    Icon: PrayIcon,
    title: "Pray",
    body: "Covering our cities, our churches, our leaders, and the next generation in prayer.",
  },
  {
    key: "impact",
    Icon: ImpactIcon,
    title: "Impact",
    body: "Helping young adults thrive, lead, and become deeply rooted in Christ and the local church.",
  },
] as const;

const HOW_IT_WORKS = [
  "Existing leaders and groups join the network in their city.",
  "The team learns who they serve, where they meet, and what they need.",
  "Leaders connect through one or two monthly touchpoints.",
  "Churches and ministries share prayer, resources, opportunities, and learning.",
  "Young adults gain clearer pathways into healthy local community.",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Young Adults Network",
  alternateName: ["YAN"],
  url: `${SITE_URL}/yan`,
  parentOrganization: { "@type": "NGO", name: "Living Water Network", url: SITE_URL },
  areaServed: YAN_CITIES.map((c) => `${c.name}, ${c.state}`),
  slogan: "A network for what God is already doing.",
};

export default function YanNationalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/national-usa-night-lights-nasa.jpg" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-yan-navy via-yan-navy/85 to-yan-navy/60" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-5">Young Adults Network</p>
            <h1 className="yan-h1 text-white mb-6 text-balance">A network for what God is already doing.</h1>
            <p className="yan-body text-white/75 max-w-2xl mx-auto mb-10 text-lg">
              YAN connects the young-adult ministries, groups, pastors, and leaders already serving
              cities across the country into one shared mission — city by city, starting in Atlanta.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.15} className="flex flex-wrap items-center justify-center gap-3">
            <CitySelector triggerLabel="Find Your City" />
            <MovementGateway triggerLabel="Get Involved" />
          </FadeInSection>
        </div>
      </section>

      {/* 2. A movement, not a program */}
      <section className="bg-white py-20 sm:py-28">
        <FadeInSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-3">The Movement</p>
          <h2 className="yan-h2 text-yan-navy mb-6">A movement, not a program.</h2>
          <p className="yan-body text-yan-navy/65 text-lg leading-relaxed">
            YAN exists to connect the young-adult ministries, groups, and leaders that already exist
            in cities across the country into one shared mission. We&apos;re not asking your church to
            build something new — we&apos;re helping what God is already doing find each other. Your
            ministry keeps its name, its leadership, and its calling, in every city YAN takes root.
          </p>
        </FadeInSection>
      </section>

      {/* 3. Choose your city — equal-weight card grid, the main "select your city" moment */}
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-14 max-w-2xl mx-auto">
            <p className="yan-eyebrow mb-3">City by City</p>
            <h2 className="yan-h2 text-yan-navy mb-4">One movement. Every city its own.</h2>
            <p className="yan-body text-yan-navy/60">
              YAN began in Atlanta — and the same movement is now taking root in new cities. Find
              yours below.
            </p>
          </FadeInSection>
          <StaggerChildren className="grid sm:grid-cols-3 gap-6">
            {YAN_CITIES.map((city) => (
              <StaggerItem key={city.slug}>
                <Link href={`/yan/${city.slug}`} className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow h-full">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={city.heroImage}
                      alt={city.heroImageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-yan-navy/70 via-transparent to-transparent" />
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-yan-heading font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        city.isFoundingHub ? "text-white bg-yan-blue" : "text-yan-navy bg-white/90"
                      }`}
                    >
                      {city.stageBadge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="yan-h3 !text-lg text-yan-navy mb-1">{city.name}</h3>
                    <p className="text-sm text-yan-navy/60 font-yan-body leading-relaxed mb-3">{city.summary}</p>
                    <span className="text-yan-blue text-sm font-semibold inline-flex items-center gap-1">
                      Explore {city.shortName}
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 4. Four pillars */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-14 max-w-2xl mx-auto">
            <p className="yan-eyebrow mb-3">What We Do</p>
            <h2 className="yan-h2 text-yan-navy">Four ways we move together.</h2>
          </FadeInSection>
          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map(({ key, Icon, title, body }) => (
              <StaggerItem key={key}>
                <div className="yan-card h-full">
                  <div className="w-12 h-12 rounded-full bg-yan-blue/10 flex items-center justify-center mb-4 text-yan-blue">
                    <Icon className="w-6 h-6 yan-animate-signal" />
                  </div>
                  <h3 className="yan-h3 text-yan-navy mb-2">{title}</h3>
                  <p className="text-sm text-yan-navy/60 font-yan-body leading-relaxed">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 5. How the network works */}
      <section className="bg-yan-navy py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/young-adults-walking-coffee.jpg" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">How It Works</p>
            <h2 className="yan-h2 text-white">A simple, sustainable rhythm — in every city.</h2>
          </FadeInSection>
          <StaggerChildren className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <StaggerItem key={i}>
                <div className="flex items-start gap-4 bg-white rounded-xl p-5 border border-yan-navy/10">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-yan-navy text-white flex items-center justify-center font-yan-heading font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="yan-body text-yan-navy/75 pt-1">{step}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* 5b. Faith anchor — Scripture + a historic Christian voice, grounding the movement in Jesus before anything else */}
      <section className="bg-white pt-20 sm:pt-28">
        <div className="px-4 sm:px-6 lg:px-8">
          <YanFaithAnchor pageKey="national" />
        </div>
      </section>

      {/* 6. Faith foundation */}
      <section className="bg-white py-20 sm:py-28">
        <FadeInSection className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow mb-6">What We Hold To</p>
          <ul className="space-y-3 text-yan-navy/75 font-yan-body text-lg">
            <li>Jesus is the center — every ministry we connect points back to Him, not to a program.</li>
            <li>Scripture and prayer come first — before strategy, before growth.</li>
            <li>Formation happens in community — no one is meant to lead, or grow, alone.</li>
            <li>The local church matters — YAN strengthens churches; it never replaces them.</li>
            <li>What&apos;s formed in one leader is meant to multiply into others — and one city into the next.</li>
          </ul>
          <p className="text-yan-navy/40 text-xs mt-8 font-yan-body">
            Condensed from Living Water Network&apos;s beliefs and formation model. The same foundation holds in every YAN city.
          </p>
        </FadeInSection>
      </section>

      {/* 7. Final gateway */}
      <section className="relative py-20 sm:py-28 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/young-adults-park-gathering.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/85" />
        </div>
        <FadeInSection className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="yan-h2 text-white mb-4">For the city. For His Kingdom.</h2>
          <p className="yan-body text-white/70 mb-8">
            Bring your ministry, your prayer, your resources, or your willingness to serve. Every
            city makes the movement stronger — including the next one.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link href="/yan/join" className="yan-btn-primary">
              Join the Network
            </Link>
          </div>
          <div className="flex justify-center">
            <YanSubscribeForm dark />
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
