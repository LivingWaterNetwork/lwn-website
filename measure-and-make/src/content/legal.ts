import { LEGAL_EFFECTIVE_DATE } from "./site";

// INTERNAL NOTE (source only, never rendered): both documents below are
// prelaunch drafts written from an audit of this repository's actual behavior.
// They have NOT been reviewed by an attorney. Both pages are noindex, and
// docs/LEGAL-REVIEW-HANDOFF.md is the handoff checklist. Attorney review of
// both is required before production launch. Do not remove the noindex or edit
// these documents to describe behavior the code does not have.

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalDocument {
  title: string;
  eyebrow: string;
  effectiveDate: string;
  summary: string;
  sections: LegalSection[];
}

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  eyebrow: "LEGAL",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  summary:
    "This policy explains what Measure & Make collects when you contact us through this website, how that information is used, and how to ask us to correct or delete it.",
  sections: [
    {
      id: "scope",
      heading: "1. Scope of this policy",
      paragraphs: [
        "This policy covers the Measure & Make website and the inquiry form it provides. Measure & Make is a for-profit venture in development, distinct from Living Water Network's charitable programs, and this policy does not cover Living Water Network's own websites, programs, or donation processing.",
        "This site is temporarily served through the Living Water Network digital ecosystem. Where that arrangement affects how information reaches us, it is described below.",
      ],
    },
    {
      id: "what-we-collect",
      heading: "2. Information you give us",
      paragraphs: [
        "The only information this site collects from you is what you type into the inquiry form and submit. Nothing on this site asks for, or accepts, payment details.",
        "The form asks for:",
      ],
      list: [
        "Your name, organization, and email address, which are required in order to reply.",
        "A phone number, if you choose to give one.",
        "A website address, if you choose to give one.",
        "The kind of organization you are, when you select it.",
        "The areas of work you are interested in, when you select them.",
        "The timeline you are working toward, when you select one.",
        "A budget range, when you select one. This is a planning signal only; it is not a quote, and no price is set by this form.",
        "Project details, in your own words. Please include only what is relevant to the inquiry, and do not send confidential, sensitive, or personal information about third parties through this form.",
      ],
    },
    {
      id: "technical",
      heading: "3. Information collected automatically",
      paragraphs: [
        "This site sets no cookies, runs no analytics, uses no advertising or tracking pixels, and does not build a profile of you. There is no consent banner because there is nothing to consent to. Web fonts are served from this site itself, so viewing a page does not call out to a font provider.",
        "When you submit the form, the server reads the IP address of your request in order to apply a rate limit that blocks repeated automated submissions. That address is held briefly in the server's memory for that purpose, is discarded when the process restarts, and is not written into your inquiry record.",
        "Like any website, this site is served by a hosting provider whose infrastructure may log ordinary request information, such as IP addresses and timestamps, for security and reliability. We do not use those logs for marketing.",
      ],
    },
    {
      id: "how-we-use",
      heading: "4. How we use your information",
      paragraphs: ["We use what you send in order to:"],
      list: [
        "Read and respond to your inquiry.",
        "Prepare for a conversation about the work you described.",
        "Keep an internal record of inquiries we have received and how we responded.",
        "Protect the form against spam and automated abuse.",
      ],
    },
    {
      id: "not-used",
      heading: "5. How we do not use your information",
      paragraphs: [
        "We do not sell, rent, or trade your information. We do not use it for advertising, and we do not add you to a newsletter or marketing list from this form. If a mailing list is offered in the future, it will be a separate, clearly labeled choice.",
        "Because Measure & Make is a for-profit venture distinct from Living Water Network's charitable programs, an inquiry sent here is not a donation and is not treated as donor information.",
      ],
    },
    {
      id: "processors",
      heading: "6. Service providers",
      paragraphs: [
        "We keep the list of parties who can see your inquiry as short as the work allows. As this site is built:",
      ],
      list: [
        "Airtable is the intended record system for inquiries. When the site is configured with its Airtable credential, a submitted inquiry is written to a private Airtable base that only Measure & Make can open, and an email notification of that inquiry is sent to our inbox. Until that credential is installed, the form cannot save anything and says so plainly rather than appearing to succeed.",
        "Our hosting provider serves these pages and processes requests to them, including the ordinary request logging described above.",
      ],
    },
    {
      id: "retention",
      heading: "7. How long we keep it",
      paragraphs: [
        "Inquiry records are kept while we are in conversation with you and for up to twenty-four months after our last contact, so that we can pick up a thread you started. After that they are deleted or anonymized unless we have a specific reason to keep them longer, such as an active agreement or a legal obligation.",
        "If you ask us to delete your inquiry sooner, we will, as described below.",
      ],
    },
    {
      id: "security",
      heading: "8. Security, and its limits",
      paragraphs: [
        "Submissions travel over an encrypted connection, the Airtable credential is held only on the server and is never sent to your browser, and access to inquiry records is limited to Measure & Make.",
        "No website or storage system can be guaranteed completely secure, and we do not claim otherwise. Please do not use this form to send anything you would not want stored in a business record system.",
      ],
    },
    {
      id: "your-choices",
      heading: "9. Access, correction, and deletion",
      paragraphs: [
        "You may ask us what we hold about you, ask us to correct it, or ask us to delete it. Submit the request through the form on the Start a Conversation page, describing what you would like done. We will act on it within a reasonable period, and we may need to confirm you are the person who sent the original inquiry before making a change.",
        "Where local law gives you further rights over your personal information, we will honor them.",
      ],
    },
    {
      id: "children",
      heading: "10. Children's privacy",
      paragraphs: [
        "This site is intended for adults inquiring on behalf of an organization or business. It is not directed to children, and we do not knowingly collect information from anyone under 13. If you believe a child has sent us information, submit a request through the form and we will delete it.",
      ],
    },
    {
      id: "links",
      heading: "11. Links to other sites",
      paragraphs: [
        "Some pages link to organizations we have worked with, or to their own websites. Those sites are not under our control and have their own privacy practices. This policy applies only to the Measure & Make website.",
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to this policy",
      paragraphs: [
        "If this policy changes, the effective date above will change with it, and the current version will always be the one published here. If a change materially affects how we handle information already submitted, we will say so on this page.",
      ],
    },
    {
      id: "contact",
      heading: "13. How to reach us",
      paragraphs: [
        "Privacy questions and requests go through the form on the Start a Conversation page. That form is the contact route for this site, and a request sent through it reaches the same records described in this policy.",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  eyebrow: "LEGAL",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  summary:
    "These terms govern your use of the Measure & Make website. They are about the website itself; paid work is always governed by a separate written agreement.",
  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance of these terms",
      paragraphs: [
        "By using this website you agree to these terms. If you do not agree with them, please do not use the site. These terms apply to the website only.",
      ],
    },
    {
      id: "purpose",
      heading: "2. The website is informational",
      paragraphs: [
        "This site describes what Measure & Make does, the process it follows, and work it has verified as complete. It is provided for general information. Nothing on it is professional, legal, financial, or technical advice for your particular situation, and nothing on it is an offer to enter into a contract.",
        "Descriptions of past work state what was built and where it stands. They are not a promise of any particular outcome for another organization.",
      ],
    },
    {
      id: "inquiries",
      heading: "3. Project inquiries",
      paragraphs: [
        "The form on the Start a Conversation page is an invitation to tell us about your organization and what you are trying to build. Please send only information you are free to share, and keep confidential material out of it until there is an agreement in place that covers it.",
      ],
    },
    {
      id: "no-relationship",
      heading: "4. An inquiry does not create a client relationship",
      paragraphs: [
        "Submitting the form, and our replying to it, does not by itself create a client relationship, a contract, or any obligation to perform work. Conversations before an agreement is signed are exploratory, and neither side is committed by them.",
      ],
    },
    {
      id: "agreements",
      heading: "5. Paid work is governed by a separate written agreement",
      paragraphs: [
        "Any engagement is defined in a separate written agreement covering scope, deliverables, timeline, fees, ownership, confidentiality, and termination. That agreement governs the work. Where it and these website terms differ, that agreement controls for the work it describes.",
        "Amounts discussed on this site or in an inquiry, including any budget range you select, are planning signals only. Fees are set in a written proposal or agreement.",
      ],
    },
    {
      id: "acceptance-of-work",
      heading: "6. We may decline an inquiry",
      paragraphs: [
        "We cannot take on every project, and we do not accept every inquiry. We may decline for reasons of fit, capacity, timing, or conflict, and we are not obliged to give a reason. Declining an inquiry says nothing about the merit of your organization or its work.",
      ],
    },
    {
      id: "intellectual-property",
      heading: "7. Intellectual property",
      paragraphs: [
        "The content of this site — its text, layout, design, code, and the Measure & Make name and marks — belongs to Measure & Make or is used with permission, and is protected by applicable law. The Measure & Make name and marks are not registered trademarks, and nothing here claims that they are.",
        "Names, marks, screenshots, and other material belonging to the organizations described in our work remain theirs, and appear here with their knowledge and for the purpose of describing that work.",
        "Ownership of anything created for a client is addressed in that client's written agreement, not by these terms.",
      ],
    },
    {
      id: "permitted-use",
      heading: "8. Permitted use of this website",
      paragraphs: [
        "You may read these pages, share links to them, and print or save a copy for your own reference or to discuss internally. Quoting a short passage with attribution is fine.",
      ],
    },
    {
      id: "prohibited-use",
      heading: "9. Prohibited use",
      paragraphs: ["You agree not to:"],
      list: [
        "Copy, republish, or resell substantial parts of this site as your own material.",
        "Use the Measure & Make name or marks in a way that suggests endorsement, partnership, or affiliation that does not exist.",
        "Submit false, misleading, or automated inquiries, or attempt to evade the form's rate limiting or spam protection.",
        "Attempt to gain unauthorized access to the site, its server, its records, or any connected system.",
        "Scrape, probe, overload, or disrupt the site or the infrastructure it runs on.",
        "Upload or transmit anything unlawful, infringing, or malicious.",
        "Use the site in violation of applicable law.",
      ],
    },
    {
      id: "accuracy",
      heading: "10. Accuracy and availability",
      paragraphs: [
        "We work to keep this site accurate and to state only what we can verify, but content may become out of date, and we may change, add, or remove pages at any time without notice.",
        "The site is provided as available. We do not promise uninterrupted access, and maintenance, hosting incidents, or configuration changes may make it temporarily unavailable. Where the inquiry form cannot save a submission, it tells you so rather than reporting success.",
      ],
    },
    {
      id: "third-party",
      heading: "11. Third-party links and services",
      paragraphs: [
        "This site links to other organizations' websites and relies on third-party services to operate, including the record system described in our Privacy Policy. Those sites and services are outside our control. We are not responsible for their content, availability, or practices, and a link is not an endorsement.",
      ],
    },
    {
      id: "warranties",
      heading: "12. Disclaimer of warranties",
      paragraphs: [
        "To the fullest extent permitted by law, this website is provided “as is” and “as available,” without warranties of any kind, whether express or implied, including any implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or uninterrupted availability. Your use of the site is at your own risk.",
      ],
    },
    {
      id: "liability",
      heading: "13. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, Measure & Make will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, or business interruption, arising out of your use of this website — even if we have been advised that such damages are possible.",
        "Nothing in these terms limits liability that cannot be limited by law. Liability for work performed under a signed agreement is governed by that agreement, not by this section.",
      ],
    },
    {
      id: "changes",
      heading: "14. Changes to these terms",
      paragraphs: [
        "We may update these terms. The effective date above changes when we do, and the version published here is the one that applies. Continuing to use the site after a change means you accept the updated terms.",
      ],
    },
    {
      id: "governing-law",
      heading: "15. Governing law",
      paragraphs: [
        "These terms are governed by the laws of the State of Georgia, without regard to its conflict-of-laws rules. Disputes arising from your use of this website are subject to the exclusive jurisdiction of the state and federal courts located in Georgia, and you consent to venue there.",
      ],
    },
    {
      id: "contact",
      heading: "16. How to reach us",
      paragraphs: [
        "Questions about these terms go through the form on the Start a Conversation page, which is the contact route for this site.",
      ],
    },
  ],
};
