import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeYanQuery } from "@/lib/yanData";
import { canonical } from "@/lib/seo";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { MovementGateway } from "@/components/yan/gateway/MovementGateway";
import { YanSubscribeForm } from "@/components/yan/sections/YanSubscribeForm";
import { YanEmptyState } from "@/components/yan/primitives/YanEmptyState";
import { ConnectIcon, CollaborateIcon, PrayIcon, ImpactIcon } from "@/components/yan/icons/PillarIcons";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lwnetwork.org";

export const metadata: Metadata = {
  ...canonical("/yan"),
  title: "YAN Atlanta | Young Adults Network Atlanta",
  description:
    "YAN Atlanta connects the young-adult ministries, groups, pastors, and leaders already serving metro Atlanta into one shared mission — a movement, not a program.",
  openGraph: {
    title: "YAN Atlanta | Young Adults Network Atlanta",
    description: "One City. Many Churches. One Mission. A network for what God is already doing across Atlanta.",
    type: "website",
    images: [{ url: "/images/yan/source/atlanta-skyline-dusk.jpg", width: 1200, height: 630, alt: "Atlanta skyline at dusk" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAN Atlanta | Young Adults Network Atlanta",
    description: "One City. Many Churches. One Mission.",
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
    body: "Covering the city, its churches, its leaders, and the next generation in prayer.",
  },
  {
    key: "impact",
    Icon: ImpactIcon,
    title: "Impact",
    body: "Helping young adults thrive, lead, and become deeply rooted in Christ and the local church.",
  },
] as const;

const HOW_IT_WORKS = [
  "Existing leaders and groups join the network.",
  "The team learns who they serve, where they meet, and what they need.",
  "Leaders connect through one or two monthly touchpoints.",
  "Churches and ministries share prayer, resources, opportunities, and learning.",
  "Young adults gain clearer pathways into healthy local community.",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Young Adults Network Atlanta",
  alternateName: ["YAN Atlanta", "YAN", "Young Adults Network"],
  url: `${SITE_URL}/yan`,
  parentOrganization: { "@type": "NGO", name: "Living Water Network", url: SITE_URL },
  areaServed: "Metro Atlanta, GA",
  slogan: "One City. Many Churches. One Mission.",
};

export default async function YanHomePage() {
  const featuredEvent = await safeYanQuery(
    () => prisma.yanEvent.findFirst({ where: { status: { in: ["coming-soon", "published"] } }, orderBy: { startsAt: "asc" } }),
    null
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/yan/source/atlanta-skyline-dusk.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-yan-navy via-yan-navy/85 to-yan-navy/50" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-5">YAN Atlanta &middot; Young Adults Network</p>
            <h1 className="yan-h1 text-white mb-6 text-balance">
              One City. <br className="sm:hidden" />
              Many Churches. <br className="sm:hidden" />
              One Mission.
            </h1>
            <p className="yan-body text-white/75 max-w-2xl mx-auto mb-10 text-lg">
              A movement connecting the young-adult ministries, groups, pastors, and leaders already
              serving Atlanta.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <MovementGateway />
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
            across Atlanta into one shared mission. We&apos;re not asking your church to build
            something new — we&apos;re helping what God is already doing find each other. Your
            ministry keeps its name, its leadership, and its calling.
          </p>
        </FadeInSection>
      </section>

      {/* 3. Atlanta network story */}
      <section className="bg-yan-navy py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInSection className="text-center mb-14">
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">A City, Connected</p>
            <h2 className="yan-h2 text-white mb-5">Atlanta&apos;s ministries, becoming one network.</h2>
            <p className="yan-body text-white/60 max-w-2xl mx-auto">
              From Midtown to the Westside, from the BeltLine to the suburbs — young-adult ministries
              are already at work across this city. YAN is the thread that connects them.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9]">
              <Image src="/images/yan/source/atlanta-beltline-bridge.jpg" alt="The Atlanta BeltLine, a walkable corridor connecting neighborhoods across the city" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-yan-navy/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
                {["Midtown", "Westside", "BeltLine", "Decatur", "East Point"].map((n) => (
                  <span key={n} className="yan-pill">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </FadeInSection>
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
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <p className="yan-eyebrow mb-3">How It Works</p>
            <h2 className="yan-h2 text-yan-navy">A simple, sustainable rhythm.</h2>
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

      {/* 6. Fall 2026 Leaders Roundtable */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/yan/source/atlanta-skyline-night.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-yan-navy/80" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <p className="yan-eyebrow yan-eyebrow-dark mb-3">Fall 2026</p>
            <h2 className="yan-h2 text-white mb-4">
              {featuredEvent ? featuredEvent.title : "The YAN Leaders Roundtable"}
            </h2>
            <p className="yan-body text-white/70 mb-8 max-w-xl mx-auto">
              {featuredEvent?.summary ??
                "A gathering for pastors and leaders currently serving young adults across Atlanta — details are being prepared. Register your interest now and be first to know when the date, venue, and capacity are confirmed."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/yan/events" className="yan-btn-primary">
                {featuredEvent ? "View event details" : "Register your interest"}
              </Link>
              <Link href="/yan/events" className="yan-btn-secondary">
                See all events
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 7. Network preview */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <YanEmptyState
              eyebrow="The Network"
              title="The map is being formed."
              body="Atlanta's young-adult ministries are just beginning to connect here. If you lead one, be a founding member — if you're looking for community, ask us to notify you when discovery opens."
              ctaHref="/yan/network"
              ctaLabel="Explore the network"
            />
          </FadeInSection>
        </div>
      </section>

      {/* 8. Stories and leaders preview */}
      <section className="bg-yan-stone py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
          <FadeInSection>
            <div className="yan-card h-full flex flex-col">
              <p className="yan-eyebrow mb-2">Leaders</p>
              <h3 className="yan-h3 text-yan-navy mb-2">Atlanta&apos;s leaders, coming soon.</h3>
              <p className="text-sm text-yan-navy/60 font-yan-body mb-6 flex-1">
                We&apos;ll introduce the pastors and ministry leaders shaping this movement here as
                the network grows.
              </p>
              <Link href="/yan/leaders" className="yan-btn-ghost text-sm self-start">
                Meet the leaders
              </Link>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div className="yan-card h-full flex flex-col">
              <p className="yan-eyebrow mb-2">Stories</p>
              <h3 className="yan-h3 text-yan-navy mb-2">The first stories are coming soon.</h3>
              <p className="text-sm text-yan-navy/60 font-yan-body mb-6 flex-1">
                As ministries connect and young adults find community, we&apos;ll share real,
                approved stories of what God is doing across the city.
              </p>
              <Link href="/yan/stories" className="yan-btn-ghost text-sm self-start">
                Read stories
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 9. Faith foundation */}
      <section className="bg-yan-navy py-20 sm:py-28">
        <FadeInSection className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="yan-eyebrow yan-eyebrow-dark mb-6">What We Hold To</p>
          <ul className="space-y-3 text-white/80 font-yan-body text-lg">
            <li>Jesus is the center — every ministry we connect points back to Him, not to a program.</li>
            <li>Scripture and prayer come first — before strategy, before growth.</li>
            <li>Formation happens in community — no one is meant to lead, or grow, alone.</li>
            <li>The local church matters — YAN strengthens churches; it never replaces them.</li>
            <li>What&apos;s formed in one leader is meant to multiply into others.</li>
          </ul>
          <p className="text-white/50 text-xs mt-8 font-yan-body">
            Condensed from Living Water Network&apos;s beliefs and formation model.
          </p>
        </FadeInSection>
      </section>

      {/* 10. Final gateway */}
      <section className="bg-white py-20 sm:py-28 text-center">
        <FadeInSection className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="yan-h2 text-yan-navy mb-4">For the city. For His Kingdom.</h2>
          <p className="yan-body text-yan-navy/60 mb-8">
            Bring your ministry, your prayer, your resources, or your willingness to serve. The
            movement gets stronger with your city in it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link href="/yan/join" className="yan-btn-primary !bg-yan-blue">
              Join the Network
            </Link>
          </div>
          <div className="flex justify-center">
            <YanSubscribeForm />
          </div>
        </FadeInSection>
      </section>
    </>
  );
}
