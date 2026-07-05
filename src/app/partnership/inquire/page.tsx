import type { Metadata } from "next";
import { InquiryForm, type InquiryField } from "@/components/sections/InquiryForm";

export const metadata: Metadata = {
  title: "Partner With Us — Start the Conversation",
  description: "Tell us about your interest in partnering with Living Water Network at a specific tier or level of investment.",
};

const fields: InquiryField[] = [
  {
    type: "select",
    id: "tier",
    label: "Which level of partnership interests you?",
    options: [
      { value: "Cornerstone Partner ($25,000/yr)", label: "Cornerstone Partner — $25,000/yr" },
      { value: "Kingdom Builder ($10,000/yr)", label: "Kingdom Builder — $10,000/yr" },
      { value: "Formation Fellow ($5,000/yr)", label: "Formation Fellow — $5,000/yr" },
      { value: "Community Sustainer ($1,000–$2,500/yr)", label: "Community Sustainer — $1,000–$2,500/yr" },
      { value: "Not sure yet", label: "Not sure yet — let's talk" },
    ],
  },
  {
    type: "textarea",
    id: "message",
    label: "Tell us a bit about what you're hoping to accomplish through this partnership",
    placeholder: "What drew you to LWN? What would you want a partnership to make possible?",
    rows: 6,
  },
];

export default function PartnershipInquirePage() {
  return (
    <>
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">A Serious Investment Deserves a Real Conversation</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Let&apos;s Talk About Partnership
          </h1>
          <p className="text-white/65 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            Whatever tier you&apos;re considering, a multi-year partnership with Living Water Network isn&apos;t
            a transaction — it&apos;s an investment in leaders who will go on to form other leaders, for
            generations. We&apos;d rather have a real conversation than rush you into a form. Tell us where
            you are, and Omar or a member of our team will personally follow up within 24–48 hours.
          </p>
        </div>
      </section>

      <section className="py-20 bg-mist">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <InquiryForm
            endpoint="/api/partnership/inquire"
            thankYouHref="/partnership/thank-you?type=inquiry"
            fields={fields}
            submitLabel="Start the Conversation"
          />
        </div>
      </section>
    </>
  );
}
