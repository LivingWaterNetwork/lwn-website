import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/sections/PrivacyPolicyContent";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
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
  return <PrivacyPolicyContent sections={sections} />;
}
