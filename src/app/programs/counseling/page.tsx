import type { Metadata } from "next";
import Image from "next/image";
import { ProgramInquiryForm, type ProgramField } from "@/components/sections/ProgramInquiryForm";

export const metadata: Metadata = {
  title: "Personalized Counseling",
  description:
    "Personalized counseling for leaders — spiritual, emotional, and relational care that helps you lead from wholeness, not depletion.",
};

const fields: ProgramField[] = [
  {
    type: "textarea",
    id: "support",
    label: "What would you like support with?",
    required: true,
    placeholder: "Share what's on your heart — burnout, a specific season, a relationship, or something else entirely.",
    rows: 6,
  },
];

export default function CounselingPage() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Healing That Empowers</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Personalized Counseling
          </h1>
          <p className="mt-4 text-white/65 text-lg font-sans max-w-xl mx-auto">
            Great leaders need great care. Let&apos;s talk about what wholeness could look like for you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-video relative shadow-md mb-6">
              <Image
                src="/images/prayer-circle.jpg"
                alt="Pastoral prayer and care"
                fill
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            </div>
            <p className="text-slate leading-relaxed text-sm font-sans">
              Our personalized counseling sessions go beyond coaching to address the spiritual, emotional,
              and relational dimensions of leadership. Through one-on-one engagements tailored to your unique
              season and challenges, we help leaders process wounds, overcome burnout, and rediscover the joy
              of serving from a place of wholeness rather than depletion.
            </p>
            <p className="text-slate leading-relaxed text-sm font-sans mt-4">
              Fill out the form and a member of our pastoral care team will reach out within 24-48 hours to
              schedule a first conversation — no pressure, just a starting point.
            </p>
          </div>

          <ProgramInquiryForm
            program="counseling"
            fields={fields}
            submitLabel="Request Counseling"
            successTitle="We've Received Your Request"
            successBody="Someone from our pastoral care team will reach out within 24-48 hours. Thank you for trusting us with this."
            detailsBuilder={(v) => `What they'd like support with:\n${v.support}`}
          />
        </div>
      </section>
    </>
  );
}
