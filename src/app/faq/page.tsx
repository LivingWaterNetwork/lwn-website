import type { Metadata } from "next";
import { FAQContent } from "@/components/sections/FAQContent";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Groundwork — LWN's 9-month Christian leadership formation journey, including cost, tracks, application steps, and program logistics.",
  openGraph: {
    title: "Frequently Asked Questions | Living Water Network",
    description:
      "Answers to common questions about Groundwork — LWN's 9-month Christian leadership formation journey.",
    type: "website",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions | Living Water Network",
    description:
      "Answers to common questions about Groundwork — LWN's 9-month Christian leadership formation journey.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: "Living Water Network" }],
  },
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap(({ items }) =>
    items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQContent faqs={faqs} />
    </>
  );
}
