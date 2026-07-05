import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore Living Water Network's programs: immersive cohorts, counseling, mentorship, speaking, and international mission trips.",
};

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
    cta: { label: "Get in Touch", href: "/contact" },
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
    cta: { label: "Learn More", href: "/contact" },
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
    cta: { label: "Request a Speaker", href: "/contact" },
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
    cta: { label: "Inquire About Trips", href: "/contact" },
  },
];

export default function ProgramsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">What We Offer</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Programs Built to Transform
          </h1>
          <p className="mt-4 text-white/65 text-lg font-sans">
            Every program at Living Water Network is designed to restore, equip, and
            release Kingdom leaders into greater impact.
          </p>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {programs.map((p, i) => (
            <div
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
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-mist text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-semibold text-navy mb-4">Not sure where to start?</h2>
          <p className="text-slate mb-8 font-sans">
            Reach out and tell us about your leadership journey — we&apos;ll point you to the
            right next step.
          </p>
          <Link href="/contact" className="btn-primary">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
