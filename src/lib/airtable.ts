/**
 * Airtable integration — pushes form submissions to an Airtable base
 * so the team can manage pipelines and follow-ups without touching the DB.
 *
 * Setup:
 *  1. Create a free Airtable account at airtable.com (apply for nonprofit discount)
 *  2. Create a base called "LWN Operations" with two tables:
 *       • "Cohort Applications"  — fields listed in CohortApplicationFields below
 *       • "Contact Submissions"  — fields listed in ContactSubmissionFields below
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
    body: JSON.stringify({ fields }),
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
