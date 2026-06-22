import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Living Water Network — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-teal py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
            Reach Out
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-white/70">
            Questions, speaking requests, partnership inquiries — we&apos;re here.
          </p>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="section-heading mb-6">Get in Touch</h2>
            <div className="space-y-4 text-charcoal/70 text-sm leading-relaxed">
              <p>
                Whether you have questions about our programs, want to invite us to speak,
                or simply want to learn more about Living Water Network — we&apos;d love to
                connect.
              </p>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@lwnetwork.org" className="text-teal hover:underline font-medium">
                  info@lwnetwork.org
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
