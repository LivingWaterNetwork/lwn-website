import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Living Water Network",
  description:
    "Answers to common questions about Groundwork — LWN's 9-month formation journey.",
};

const faqs = [
  {
    category: "About Groundwork",
    items: [
      {
        q: "What is Groundwork?",
        a: "Groundwork is LWN's 9-month formation journey — three phases, three tracks, one purpose: to form you before you are sent. It is not a course to complete. It is an invitation to be remade — spiritually, emotionally, and vocationally — so that what flows through you is rooted in something deep.",
      },
      {
        q: "Who is Groundwork for?",
        a: "Groundwork is for emerging Kingdom leaders who sense a calling but want to be formed before they are activated. Whether you are called to ministry, the marketplace, or the creative world, Groundwork is for those who are serious about becoming who God has made them to be — before stepping into what He has called them to do.",
      },
      {
        q: "What are the three tracks?",
        a: "Shepherd (Ministry & Mission), Builder (Marketplace & Entrepreneurship), and Canvas (Creatives & Influencers). All three tracks walk through Phase 1 together using the same formation curriculum. Phases 2 and 3 are shaped by the specific lane God has called you to.",
      },
    ],
  },
  {
    category: "The Program",
    items: [
      {
        q: "How long is the program?",
        a: "Nine months — three phases of three months each. Phase 1 (At the Table) is 12 weeks of whole-person formation. Phase 2 (Discover & Refine) is calling discovery, gift identification, and inner healing. Phase 3 (Activate) moves you into the field — local serving, missions fundraising, and an international trip.",
      },
      {
        q: "Who leads the groups?",
        a: "Groups are led by seasoned, formed leaders from local churches and organizations — men and women who have walked the formation process themselves. Pastoral and licensed therapeutic support is woven throughout, particularly in Phase 2.",
      },
      {
        q: "What is 'At the Table'?",
        a: "At the Table is LWN's proprietary 12-week formation guide authored by Omar J. Fandino. It covers six pillars of whole-person health: Presence, Mind, Heart, Body, Community, and Stewardship. It is not a curriculum to consume — it is a practice-based guide designed to form you through repeated encounter and embodied obedience.",
      },
      {
        q: "What is the international missions trip?",
        a: "In Phase 3, all tracks participate in one international missions trip together — serving as Jesus served, going where He goes, giving what He has given. All three tracks go to the same location but serve according to their formation and calling. Past trips have included work in Latin America.",
      },
    ],
  },
  {
    category: "Logistics & Cost",
    items: [
      {
        q: "How much does it cost?",
        a: "Groundwork runs on a scholarship model. Program costs are covered by LWN ministry partners, meaning the full program is made accessible regardless of financial capacity. An application fee is required to reserve your spot and confirm commitment.",
      },
      {
        q: "Is the program in-person or virtual?",
        a: "The program is delivered virtually, making it accessible from anywhere in the world. Some in-person intensives and the international missions trip are built into the experience.",
      },
      {
        q: "How many people are in a cohort group?",
        a: "Groups are intentionally small — 8 to 12 people per track. Formation requires being known, and being known requires space. We do not scale at the expense of depth.",
      },
      {
        q: "When does the next cohort begin?",
        a: "Applications for Spring 2027 are now open. Spots are limited. Fill out the application on the Cohort page and our team will be in touch within a few business days.",
      },
    ],
  },
  {
    category: "Getting In",
    items: [
      {
        q: "How do I apply?",
        a: "Fill out the application form on the Cohort page. We'll be in touch within a few business days to discuss next steps. An application fee is required to reserve your spot.",
      },
      {
        q: "Can I apply if I don't know which track fits me?",
        a: "Yes. The application includes questions to help us understand where you are and where God may be calling you. Our team will walk through the tracks with you if needed.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Frequently Asked Questions</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Questions About Groundwork
          </h1>
          <p className="text-white/65 font-sans text-base leading-relaxed">
            Everything you need to know about LWN&apos;s 9-month formation journey.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {faqs.map(({ category, items }) => (
            <div key={category}>
              <h2 className="font-serif text-2xl text-navy font-semibold mb-6 pb-3 border-b border-mist">
                {category}
              </h2>
              <div className="space-y-6">
                {items.map(({ q, a }) => (
                  <div key={q} className="group">
                    <h3 className="font-sans font-semibold text-navy text-base mb-2">{q}</h3>
                    <p className="text-slate font-sans text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mist text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="section-label mb-3">Still have questions?</p>
          <h2 className="section-heading mb-4">We&apos;d love to talk.</h2>
          <p className="text-slate font-sans text-sm leading-relaxed mb-6">
            Reach out directly or apply and our team will be in touch.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cohort#apply" className="btn-primary">
              Apply for Groundwork
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
