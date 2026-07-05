import type { Metadata } from "next";
import { InquiryForm, type InquiryField } from "@/components/sections/InquiryForm";

export const metadata: Metadata = {
  title: "Sponsor the Gala",
  description: "Reserve a table or sponsor Living Water Network's annual Black Tie Gala — Atlanta's Kingdom leadership vision night.",
};

const fields: InquiryField[] = [
  {
    type: "select",
    id: "sponsorshipLevel",
    label: "Sponsorship level of interest",
    required: true,
    placeholder: "Select a level",
    options: [
      { value: "Presenting Table ($10,000, 10 seats)", label: "Presenting Table — $10,000 (10 seats)" },
      { value: "Gold Table ($5,000, 10 seats)", label: "Gold Table — $5,000 (10 seats)" },
      { value: "Silver Table ($2,500, 10 seats)", label: "Silver Table — $2,500 (10 seats)" },
      { value: "Individual Ticket(s) ($250 each)", label: "Individual Ticket(s) — $250 each" },
      { value: "Not sure yet", label: "Not sure yet" },
    ],
  },
  {
    type: "text",
    id: "ticketCount",
    label: "Number of tickets/seats (if applicable)",
    placeholder: "e.g. 1, 4, 10",
  },
  {
    type: "textarea",
    id: "message",
    label: "Anything else we should know",
    placeholder: "Special requests, guest names, or questions about the evening",
    rows: 5,
  },
];

export default function SponsorTheGalaPage() {
  return (
    <>
      <section className="py-24 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="section-label text-spring mb-4">The Annual Black Tie Gala</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Help Us Build the Room
          </h1>
          <p className="text-white/65 font-sans text-lg leading-relaxed max-w-2xl mx-auto">
            150 CEOs and executive pastors, Black Tie, Atlanta — a high-scale vision night that launches each
            year of ministry. Reserving a table isn&apos;t just underwriting an event; it&apos;s putting your
            name behind the room where the next wave of Kingdom leaders gets introduced to what&apos;s possible.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Presenting Table", price: "$10,000", note: "10 seats · Stage recognition + speaking moment" },
            { label: "Gold Table", price: "$5,000", note: "10 seats · Logo on table + program recognition" },
            { label: "Silver Table", price: "$2,500", note: "10 seats · Program recognition" },
            { label: "Individual Ticket", price: "$250", note: "Single seat, general admission" },
          ].map(({ label, price, note }) => (
            <div key={label} className="bg-mist rounded-xl p-5 text-center">
              <p className="text-xs font-extrabold font-sans uppercase tracking-widest text-copper mb-2">{label}</p>
              <p className="font-serif text-2xl font-semibold text-navy mb-2">{price}</p>
              <p className="text-slate/70 text-xs font-sans leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-xs text-slate/50 font-sans max-w-2xl mx-auto">
          Gala date and venue TBD — Winter 2026. Reach out below to reserve your table early.
        </p>
      </section>

      <section className="py-16 bg-mist">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="section-label mb-2">Reserve Your Table</p>
            <h2 className="section-heading">Sponsor the Gala</h2>
          </div>
          <InquiryForm
            endpoint="/api/partnership/gala"
            thankYouHref="/partnership/thank-you?type=gala"
            fields={fields}
            submitLabel="Reserve My Table"
          />
        </div>
      </section>
    </>
  );
}
