"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/StaggerChildren";
import { RevealText } from "@/components/motion/RevealText";

const programs = [
  {
    id: "cohorts",
    image: "/images/prayer-small-group.jpg",
    imageAlt: "Leaders in formation together",
    imagePosition: "50% 50%",
    title: "Immersive Cohorts",
    tagline: "Transformed together.",
    body: `Our signature cohort experience is a multi-week journey in spiritual formation,
    discipleship, and practical leadership development. Designed for leaders in both ministry
    and the marketplace, each cohort is a carefully curated community where participants are
    challenged, equipped, and restored alongside peers who share the same Kingdom calling.
    Participants leave with a deeper sense of identity, clarity of vision, and renewed
    capacity to lead with integrity.`,
    cta: { label: "Apply for the Next Cohort", href: "/cohort" },
  },
  {
    id: "counseling",
    image: "/images/prayer-circle.jpg",
    imageAlt: "Pastoral prayer and care",
    imagePosition: "50% 30%",
    title: "Personalized Counseling",
    tagline: "Healing that empowers.",
    body: `Great leaders need great care. Our personalized counseling sessions go beyond
    coaching to address the spiritual, emotional, and relational dimensions of leadership.
    Through one-on-one engagements tailored to your unique season and challenges, we help
    leaders process wounds, overcome burnout, and rediscover the joy of serving from a
    place of wholeness rather than depletion.`,
    cta: { label: "Get in Touch", href: "/programs/counseling" },
  },
  {
    id: "coaching",
    image: "/images/omar-with-colleague.jpg",
    imageAlt: "Omar Fandino in a one-on-one coaching conversation",
    imagePosition: "50% 30%",
    title: "Personal Coaching",
    tagline: "Formation, one-on-one.",
    body: `The same Six Spheres formation model behind Groundwork, built entirely around
    you. One-on-one coaching with founder Omar Fandino pairs a personalized plan across
    your spiritual, mental, emotional, physical, relational, and stewardship health with
    direct access between sessions — for leaders who need focused, honest formation on
    their own timeline, not a cohort calendar.`,
    cta: { label: "Explore Coaching", href: "/programs/coaching" },
  },
  {
    id: "mentorship",
    image: "/images/radical-mentoring-group.jpg",
    imageAlt: "Men in a Radical Mentoring group",
    imagePosition: "50% 50%",
    title: "Strategic Mentorships",
    tagline: "Iron sharpening iron.",
    body: `We believe every leader needs a Paul and a Timothy — someone ahead of them on
    the journey and someone they are helping along. Our strategic mentorship program pairs
    seasoned leaders with emerging ones for intentional, Spirit-led relationships built
    around accountability, wisdom transfer, and Kingdom vision alignment.`,
    cta: { label: "Learn More", href: "/programs/mentorship" },
  },
  {
    id: "speaking",
    image: "/images/omar-speaking-stage.jpg",
    imageAlt: "Omar speaking at a large leadership event",
    imagePosition: "50% 50%",
    title: "Public Speaking Engagements",
    tagline: "Bringing the message to you.",
    body: `Living Water Network offers dynamic speaking engagements for churches,
    conferences, retreats, and corporate leadership events. Our messages are rooted in
    Scripture, shaped by experience, and delivered to ignite Kingdom vision in whatever
    context we're invited into. If your organization is looking for a speaker who can
    bridge the ministry and marketplace gap, we'd love to connect.`,
    cta: { label: "Request a Speaker", href: "/programs/speaking" },
  },
  {
    id: "missions",
    image: "/images/missions-kids-ministry.jpg",
    imageAlt: "LWN team serving children on an international mission trip",
    imagePosition: "50% 20%",
    title: "International Mission Trips",
    tagline: "Broadened perspective, deepened calling.",
    body: `There is nothing like crossing a border to reshape a leader's worldview.
    Our international mission trips are designed not just to serve global communities but
    to transform the leader who goes. Participants return with a widened Kingdom perspective,
    a global network of believers, and a sharpened sense of their own mandate in the earth.`,
    cta: { label: "Inquire About Trips", href: "/programs/missions" },
  },
  {
    id: "church-advisory",
    image: "/images/leadership-group-backstage.jpg",
    imageAlt: "Church leadership team meeting",
    imagePosition: "50% 40%",
    title: "LWN Church Advisory Services",
    tagline: "Strategy for the church itself, not just its leaders.",
    body: `Built on Omar Fandino's own background in volunteer recruitment and engagement
    management, young adult ministry, and small group leadership, LWN Church Advisory
    Services works directly with church staff and leadership teams — not individuals — on
    the systems and strategy that determine whether a congregation actually functions:
    volunteer pipelines, young adult engagement, group leadership development, and overall
    ministry strategy.`,
    cta: { label: "Explore Church Advisory", href: "/programs/church-advisory" },
  },
];

export function ProgramsPageContent() {
  return (
    <>
      {/* Header */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <FadeInSection>
            <p className="section-label text-spring mb-3">What We Offer</p>
          </FadeInSection>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            <RevealText text="Programs Built to Transform" />
          </h1>
          <FadeInSection delay={0.3}>
            <p className="mt-4 text-white/65 text-lg font-sans">
              Every program at Living Water Network is designed to restore, equip, and
              release Kingdom leaders into greater impact.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <StaggerChildren className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {programs.map((p, i) => (
            <StaggerItem
              key={p.id}
              className={`grid md:grid-cols-2 gap-10 items-center ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Photo */}
              <div
                className={`rounded-2xl overflow-hidden aspect-video relative shadow-md ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: p.imagePosition }}
                />
              </div>

              {/* Content */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <p className="section-label mb-2">{p.tagline}</p>
                <h2 className="font-serif text-3xl font-semibold text-navy mb-4">{p.title}</h2>
                <p className="text-slate leading-relaxed text-sm mb-6 font-sans">{p.body}</p>
                <Link href={p.cta.href} className="btn-primary">{p.cta.label}</Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* YAN Atlanta initiative */}
      <section className="py-16 bg-white border-t border-mist">
        <FadeInSection className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-navy px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <p className="section-label text-spring mb-2">An LWN Initiative</p>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3">
                YAN Atlanta — connecting the city&apos;s young-adult ministries
              </h2>
              <p className="text-white/70 text-sm font-sans leading-relaxed max-w-xl">
                Young Adults Network is a citywide movement helping the young-adult ministries,
                groups, and leaders already serving Atlanta find one another, pray together, and
                grow stronger together.
              </p>
            </div>
            <Link href="/yan" className="btn-copper shrink-0">
              Explore YAN Atlanta
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-mist text-center">
        <FadeInSection className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold text-navy mb-4">Not sure where to start?</h2>
          <p className="text-slate mb-8 font-sans">
            Reach out and tell us about your leadership journey — we&apos;ll point you to the
            right next step.
          </p>
          <Link href="/contact" className="btn-primary">Contact Us</Link>
        </FadeInSection>
      </section>
    </>
  );
}
