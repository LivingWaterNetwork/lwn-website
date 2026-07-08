import type { Metadata } from "next";
import Image from "next/image";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a Christian Leadership Speaker",
  description:
    "Bring Living Water Network's message on Christian leadership, discipleship, and marketplace ministry to your church, conference, retreat, or corporate leadership event.",
  openGraph: {
    title: "Request a Speaker | Living Water Network",
    description:
      "Bring a message on Christian leadership, discipleship, and marketplace ministry to your church, conference, or event.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Speaker | Living Water Network",
    description:
      "Bring a message on Christian leadership, discipleship, and marketplace ministry to your church, conference, or event.",
  },
};

const fields: ProgramField[] = [
  {
    type: "text",
    id: "eventName",
    label: "Event name",
    required: true,
    placeholder: "e.g. Fall Leadership Retreat",
  },
  {
    type: "text",
    id: "eventDate",
    label: "Event date (approximate)",
    placeholder: "e.g. October 2026, or a specific date",
  },
  {
    type: "text",
    id: "audienceSize",
    label: "Expected audience size",
    placeholder: "e.g. 50, 200, 500+",
  },
  {
    type: "textarea",
    id: "topic",
    label: "What would you like our speaker to speak on?",
    required: true,
    placeholder: "Share the theme, the audience, and anything else that would help us prepare the right message.",
    rows: 5,
  },
];

export default function SpeakingPage() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Bringing the Message to You</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Request a Speaker
          </h1>
          <p className="mt-4 text-white/65 text-lg font-sans max-w-xl mx-auto">
            Dynamic speaking for churches, conferences, retreats, and corporate leadership events.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6">
              <Image
                src="/images/omar-speaking-stage.jpg"
                alt="One of our speakers addressing a large leadership event"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Living Water Network offers dynamic speaking engagements for churches, conferences, retreats,
              and corporate leadership events. Our messages are rooted in Scripture, shaped by experience, and
              delivered to ignite Kingdom vision in whatever context we&apos;re invited into.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans mt-4">
              If your organization is looking for a speaker who can bridge the ministry and marketplace gap,
              tell us about your event below.
            </p>
          </div>

          <ProgramInquiryForm
            program="speaking"
            fields={fields}
            submitLabel="Request a Speaker"
            successTitle="Request Received"
            successBody="Thank you for the invitation — our team will follow up to confirm availability and details."
          />
        </div>
      </section>
    </>
  );
}
