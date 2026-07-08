import type { Metadata } from "next";
import Image from "next/image";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christian Leadership Mentorship",
  description:
    "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones — iron sharpening iron, built around accountability and Kingdom vision.",
  openGraph: {
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Leadership Mentorship | Living Water Network",
    description:
      "Discipleship-based mentorship pairing seasoned Christian leaders with emerging ones.",
  },
};

const fields: ProgramField[] = [
  {
    type: "select",
    id: "role",
    label: "Are you seeking a mentor, or interested in mentoring others?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "seeking", label: "Seeking a mentor" },
      { value: "mentoring", label: "Interested in mentoring others" },
      { value: "both", label: "Open to either" },
    ],
  },
  {
    type: "textarea",
    id: "season",
    label: "Tell us about your season and what you're hoping for",
    required: true,
    placeholder: "Where are you right now, and what would a good mentorship relationship help you move toward?",
    rows: 6,
  },
];

export default function MentorshipPage() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Iron Sharpening Iron</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Strategic Mentorship
          </h1>
          <p className="mt-4 text-white/65 text-lg font-sans max-w-xl mx-auto">
            Every leader needs a Paul and a Timothy — someone ahead of them, and someone they&apos;re helping along.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6">
              <Image
                src="/images/omar-mentorship-portrait.jpg"
                alt="Omar Fandino with a ministry partner in a black blazer, arm around his shoulder in a playful, confident pose"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-slate leading-relaxed text-sm font-sans">
              We believe every leader needs a Paul and a Timothy — someone ahead of them on the journey and
              someone they are helping along. Our strategic mentorship program pairs seasoned leaders with
              emerging ones for intentional, Spirit-led relationships built around accountability, wisdom
              transfer, and Kingdom vision alignment.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans mt-4">
              Tell us where you are, and we&apos;ll help find the right fit — whether that&apos;s a mentor for
              you, or a mentee who could use what you&apos;ve learned.
            </p>
          </div>

          <ProgramInquiryForm
            program="mentorship"
            fields={fields}
            submitLabel="Submit Interest"
            successTitle="Thank You"
            successBody="We've received your interest and will follow up to talk through the right fit."
          />
        </div>
      </section>
    </>
  );
}
