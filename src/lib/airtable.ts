/**
 * Airtable integration — pushes form submissions to an Airtable base
 * so the team can manage pipelines and follow-ups without touching the DB.
 *
 * Setup:
 *  1. Create a free Airtable account at airtable.com (apply for nonprofit discount)
 *  2. Create a base called "LWN Operations" with tables:
 *       • "Cohort Applications"  — fields listed in CohortApplicationFields below
 *       • "Contact Submissions"  — fields listed in ContactSubmissionFields below
 *       • "Program Inquiries"    — fields listed near pushProgramInquiry below
 *  3. Go to airtable.com/create/tokens → create a Personal Access Token
 *       Scopes needed: data.records:write   Resources: your base
 *  4. Copy your Base ID from the URL: airtable.com/appXXXXXXXXXXXXXX/...
 *  5. Add the env vars below to .env.local
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID ?? "";

// Table names must match exactly what you created in Airtable
const COHORT_TABLE = "Cohort Applications";
const CONTACT_TABLE = "Contact Submissions";
const PROGRAM_INQUIRY_TABLE = "Program Inquiries";
const PARTNERSHIP_INQUIRY_TABLE = "Partnership Inquiries";
const PLEDGE_INQUIRY_TABLE = "Multi-Year Pledge Inquiries";
const GALA_SPONSORSHIP_TABLE = "Gala Sponsorship Inquiries";

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

async function createRecord(table: string, fields: Record<string, unknown>) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("[airtable] AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set — skipping");
    return null;
  }

  const res = await fetch(`${AIRTABLE_BASE_URL}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields, typecast: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[airtable] Failed to create record in "${table}": ${err}`);
  }

  return res.json();
}

// ─── Cohort Applications ──────────────────────────────────────────────────────
// Create these fields in your "Cohort Applications" Airtable table:
//   Name            Single line text
//   Email           Email
//   Phone           Phone number
//   City            Single line text
//   State           Single line text
//   Role            Single line text
//   Organization    Single line text
//   Why Join        Long text
//   Referral        Single line text
//   Status          Single select  (options: Applied, Reviewing, Accepted, Waitlisted, Declined, Enrolled)
//   Applied At      Date

export async function pushCohortApplication(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  role?: string;
  ministry?: string;
  whyJoin: string;
  referral?: string;
}) {
  return createRecord(COHORT_TABLE, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone ?? "",
    City: data.city ?? "",
    State: data.state ?? "",
    Role: data.role ?? "",
    Organization: data.ministry ?? "",
    "Why Join": data.whyJoin,
    Referral: data.referral ?? "",
    Status: "Applied",
    "Applied At": new Date().toISOString().split("T")[0],
  });
}

// ─── Contact Submissions ──────────────────────────────────────────────────────
// Create these fields in your "Contact Submissions" Airtable table:
//   Name            Single line text
//   Email           Email
//   Message         Long text
//   Status          Single select  (options: New, In Progress, Responded)
//   Submitted At    Date

export async function pushContactSubmission(data: {
  name: string;
  email: string;
  message: string;
}) {
  return createRecord(CONTACT_TABLE, {
    Name: data.name,
    Email: data.email,
    Message: data.message,
    Status: "New",
    "Submitted At": new Date().toISOString().split("T")[0],
  });
}

// ─── Program Inquiries ────────────────────────────────────────────────────────
// Create these fields in your "Program Inquiries" Airtable table:
//   Name            Single line text
//   Email           Email
//   Phone           Phone number
//   Program         Single select  (options: Counseling, Mentorship, Speaking, Missions)
//   Details         Long text
//   Status          Single select  (options: New, In Progress, Responded)
//   Submitted At    Date

export async function pushProgramInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  program: string;
  details: string;
}) {
  return createRecord(PROGRAM_INQUIRY_TABLE, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone ?? "",
    Program: data.program,
    Details: data.details,
    Status: "New",
    "Submitted At": new Date().toISOString().split("T")[0],
  });
}

// ─── Partnership Inquiries ────────────────────────────────────────────────────
// Create these fields in your "Partnership Inquiries" Airtable table:
//   Name            Single line text
//   Email           Email
//   Phone           Phone number
//   Organization    Single line text
//   Tier            Single select  (Cornerstone Partner, Kingdom Builder, Formation Fellow, Community Sustainer, Not sure yet)
//   Message         Long text
//   Status          Single select  (New, In Progress, Responded)
//   Submitted At    Date

export async function pushPartnershipInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  tier?: string;
  message?: string;
}) {
  return createRecord(PARTNERSHIP_INQUIRY_TABLE, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone ?? "",
    Organization: data.organization ?? "",
    Tier: data.tier ?? "",
    Message: data.message ?? "",
    Status: "New",
    "Submitted At": new Date().toISOString().split("T")[0],
  });
}

// ─── Multi-Year Pledge Inquiries ──────────────────────────────────────────────
// Create these fields in your "Multi-Year Pledge Inquiries" Airtable table:
//   Name              Single line text
//   Email             Email
//   Phone             Phone number
//   Organization      Single line text
//   Pledge Length     Single select  (3 years, 4 years, 5 years)
//   Estimated Annual  Single line text
//   Message           Long text
//   Status            Single select  (New, In Progress, Responded)
//   Submitted At      Date

export async function pushMultiYearPledgeInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  pledgeLength?: string;
  estimatedAnnual?: string;
  message?: string;
}) {
  return createRecord(PLEDGE_INQUIRY_TABLE, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone ?? "",
    Organization: data.organization ?? "",
    "Pledge Length": data.pledgeLength ?? "",
    "Estimated Annual": data.estimatedAnnual ?? "",
    Message: data.message ?? "",
    Status: "New",
    "Submitted At": new Date().toISOString().split("T")[0],
  });
}

// ─── Gala Sponsorship Inquiries ───────────────────────────────────────────────
// Create these fields in your "Gala Sponsorship Inquiries" Airtable table:
//   Name                Single line text
//   Email               Email
//   Phone               Phone number
//   Organization        Single line text
//   Sponsorship Level   Single select  (Presenting Table $10,000, Gold Table $5,000, Silver Table $2,500, Individual Ticket(s), Not sure yet)
//   Ticket Count        Single line text
//   Message             Long text
//   Status              Single select  (New, In Progress, Responded)
//   Submitted At        Date

export async function pushGalaSponsorshipInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  sponsorshipLevel?: string;
  ticketCount?: string;
  message?: string;
}) {
  return createRecord(GALA_SPONSORSHIP_TABLE, {
    Name: data.name,
    Email: data.email,
    Phone: data.phone ?? "",
    Organization: data.organization ?? "",
    "Sponsorship Level": data.sponsorshipLevel ?? "",
    "Ticket Count": data.ticketCount ?? "",
    Message: data.message ?? "",
    Status: "New",
    "Submitted At": new Date().toISOString().split("T")[0],
  });
}
