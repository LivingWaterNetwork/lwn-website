import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Living Water Network",
  description: "Terms governing use of the lwnetwork.org website.",
};

const sections = [
  {
    heading: "2.1 Acceptance of Terms",
    body: [
      "By accessing or using the Site, you agree to be bound by these Terms and by our Privacy Policy. If you do not agree, please do not use the Site.",
    ],
  },
  {
    heading: "2.2 Appropriate Use",
    body: [
      "You agree to use the Site only for lawful purposes and in a manner consistent with LWN's mission. You agree not to: use the Site to transmit harmful or malicious code; attempt to gain unauthorized access to Site systems or data; impersonate any person or entity; or use the Site in any way that could damage, disable, or impair the Site or interfere with others' use of it.",
    ],
  },
  {
    heading: "2.3 Program and Cohort Applications",
    body: [
      "Submitting an application for an LWN program, cohort, or mentorship opportunity (including “At the Table”) does not guarantee acceptance into that program. LWN reviews applications at its discretion and will communicate decisions directly to applicants.",
    ],
  },
  {
    heading: "2.4 Intellectual Property",
    body: [
      "All content on the Site — including text, graphics, logos, images, and design elements — and all LWN program materials, including the “At the Table” curriculum, and LWN's name, logo, and other branding, are the property of Living Water Network Inc. or its licensors and are protected by applicable copyright, trademark, and other intellectual property laws. You may view and share Site content for personal, non-commercial purposes, but may not reproduce, distribute, or create derivative works from LWN materials (including program curricula) without LWN's prior written permission.",
    ],
  },
  {
    heading: "2.5 Donations",
    body: [
      "Donations made through the Site are voluntary contributions to a 501(c)(3) tax-exempt organization. Donations are generally non-refundable once processed, except where required by law or where LWN, in its discretion, determines a refund is appropriate (for example, in the case of a clear processing error). If you believe a donation was made in error, please contact us promptly at ofandino@lwnetwork.org so we can look into it.",
    ],
  },
  {
    heading: "2.6 Disclaimer of Warranties",
    body: [
      "The Site and its content are provided “as is” and “as available,” without warranties of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. LWN does not warrant that the Site will be uninterrupted, error-free, or secure.",
    ],
  },
  {
    heading: "2.7 Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, LWN and its officers, directors, employees, and volunteers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the Site.",
    ],
  },
  {
    heading: "2.8 Governing Law",
    body: [
      "These Terms are governed by the laws of the State of Georgia, without regard to its conflict-of-laws principles.",
    ],
  },
  {
    heading: "2.9 Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.",
    ],
  },
  {
    heading: "2.10 Contact Us",
    body: ["Questions about these Terms may be directed to ofandino@lwnetwork.org."],
  },
];

export default function TermsOfUsePage() {
  return (
    <>
      <section className="bg-navy py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Terms of Use
          </h1>
          <p className="text-white/65 font-sans text-sm">Effective Date: July 5, 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate font-sans text-base leading-relaxed mb-10">
            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of lwnetwork.org (the &ldquo;Site&rdquo;), operated by Living Water Network Inc. (&ldquo;LWN,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using the Site, you agree to these Terms.
          </p>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-serif text-xl text-navy font-semibold mb-3">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="text-slate font-sans text-sm leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
