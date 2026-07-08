import type { Metadata } from "next";
import Image from "next/image";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

// See src/app/programs/counseling/page.tsx for why this is forced dynamic
// (sibling route hit a static-generation build timeout; applied here too
// defensively since this page is structurally identical).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "International Mission Trips",
  description:
    "Inquire about Living Water Network's international mission trips for Christian leaders — broadened perspective, deepened calling, hands-on Kingdom service.",
  openGraph: {
    title: "International Mission Trips | Living Water Network",
    description:
      "International mission trips for Christian leaders — broadened perspective, deepened calling.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "International Mission Trips | Living Water Network",
    description:
      "International mission trips for Christian leaders — broadened perspective, deepened calling.",
  },
};

const fields: ProgramField[] = [
  {
    type: "select",
    id: "priorExperience",
    label: "Have you been on a missions trip before?",
    required: true,
    placeholder: "Select one",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No, this would be my first" },
    ],
  },
  {
    type: "textarea",
    id: "draw",
    label: "What draws you to this trip?",
    required: true,
    placeholder: "Tell us what's pulling you toward this — a calling, a curiosity, a nudge you can't shake.",
    rows: 6,
  },
];

export default function MissionsPage() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Broadened Perspective, Deepened Calling</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            International Mission Trips
          </h1>
          <p className="mt-4 text-white/65 text-lg font-sans max-w-xl mx-auto">
            There is nothing like crossing a border to reshape a leader&apos;s worldview.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6">
              <Image
                src="/images/missions-kids-ministry.jpg"
                alt="LWN team serving children on an international mission trip"
                fill
                className="object-cover"
                style={{ objectPosition: "50% 20%" }}
              />
            </div>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Our international mission trips are designed not just to serve global communities but to
              transform the leader who goes. Participants return with a widened Kingdom perspective, a global
              network of believers, and a sharpened sense of their own mandate in the earth.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans mt-4">
              Tell us a bit about yourself and what&apos;s drawing you toward this, and our missions team will
              follow up with upcoming trip details.
            </p>
          </div>

          <ProgramInquiryForm
            program="missions"
            fields={fields}
            submitLabel="Inquire About Trips"
            successTitle="Thank You"
            successBody="Our missions team will follow up with upcoming trip dates and next steps."
          />
        </div>
      </section>
    </>
  );
}
