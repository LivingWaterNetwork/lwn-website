import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Living Water Network collects, uses, and protects information collected through lwnetwork.org.",
};

const sections = [
  {
    heading: "1.1 Information We Collect",
    body: [
      "We may collect the following categories of information through the Site:",
    ],
    list: [
      "Contact form submissions, including your name, email address, phone number, and any message you send us.",
      "Donation and payment information, when you make a financial contribution through the Site. Payment card and bank details are collected and processed by our third-party payment processor, not stored directly on our servers.",
      "Newsletter sign-up information, including your name and email address, if you subscribe to receive communications from us.",
      "Cohort or program application data, including information you voluntarily submit when applying to participate in an LWN program such as “At the Table” or a mentorship cohort.",
      "Basic analytics data, such as pages visited, browser type, and general location, collected automatically through standard analytics tools.",
    ],
  },
  {
    heading: "1.2 How We Use Information",
    body: ["We use the information we collect to:"],
    list: [
      "Respond to inquiries submitted through our contact form.",
      "Process and acknowledge donations, and issue tax-deductible gift receipts.",
      "Send newsletters and program updates to subscribers who have opted in.",
      "Evaluate and communicate with applicants to LWN cohorts and programs.",
      "Understand how visitors use the Site so we can improve its content and functionality.",
      "Comply with applicable legal, tax, and recordkeeping obligations.",
    ],
  },
  {
    heading: "1.3 Payment Processing",
    body: [
      "Donations and payments made through the Site are processed by our third-party payment processor. That processor collects and handles your payment card or bank information directly, under its own privacy and security practices. LWN does not store full payment card numbers on its own systems.",
    ],
  },
  {
    heading: "1.4 No Sale of Personal Data",
    body: [
      "LWN does not sell, rent, or trade your personal information to third parties for marketing or any other purpose.",
    ],
  },
  {
    heading: "1.5 Cookies and Analytics",
    body: [
      "The Site may use cookies and similar technologies, including third-party analytics tools, to understand how visitors use the Site and to improve the visitor experience. You can control cookies through your browser settings; disabling cookies may affect some Site functionality.",
    ],
  },
  {
    heading: "1.6 Children's Privacy",
    body: [
      "The Site is not directed to children under 13, and we do not knowingly collect personal information online from children under 13 through the Site, consistent with the Children's Online Privacy Protection Act (COPPA). This online policy is separate from, and does not replace, the in-person parental consent and waiver process LWN uses for minors participating in youth ministry activities or missions trips, which is governed by LWN's Child & Youth Protection Policy and event-specific waiver forms rather than by online data collection through the Site.",
    ],
  },
  {
    heading: "1.7 Data Retention",
    body: [
      "We retain personal information collected through the Site for as long as reasonably necessary to fulfill the purposes described in this Policy, including recordkeeping, tax, and legal requirements, consistent with LWN's internal Document Retention & Destruction Policy. You may request deletion of your contact or newsletter information at any time by emailing us at the address below, subject to any records we are legally required to retain.",
    ],
  },
  {
    heading: "1.8 Data Security",
    body: [
      "We use reasonable administrative and technical safeguards to protect information submitted through the Site. However, no method of transmission or storage over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "1.9 Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected by updating the Effective Date at the top of this Policy.",
    ],
  },
  {
    heading: "1.10 Contact Us",
    body: [
      "If you have questions about this Privacy Policy or how your information is handled, please contact us at ofandino@lwnetwork.org.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-navy py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="section-label text-spring mb-3">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/65 font-sans text-sm">Effective Date: July 5, 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate font-sans text-base leading-relaxed mb-10">
            This Privacy Policy describes how Living Water Network Inc. (&ldquo;LWN,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects information collected through our website, lwnetwork.org (the &ldquo;Site&rdquo;).
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
                {s.list && (
                  <ul className="list-disc pl-5 space-y-2">
                    {s.list.map((item, i) => (
                      <li key={i} className="text-slate font-sans text-sm leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
