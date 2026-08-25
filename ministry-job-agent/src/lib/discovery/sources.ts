/**
 * Discovery source registry.
 *
 * Every source declares its own access policy. The agent reads this before it
 * touches a site, and a source whose policy is not AUTOMATED_ALLOWED never gets
 * an automated fetch — it produces a manual-review work item instead.
 *
 * Nothing here bypasses authentication, rate limits, robots directives, or
 * anti-bot systems. Where a site requires a human, the workflow requires a human.
 *
 * The policies below are conservative defaults, not legal advice. Before
 * enabling automation on any source, check that site's current Terms of Service
 * and robots.txt and record the decision in docs/source-policies.md.
 */

export type AccessPolicy =
  /** Public content, no login, automated fetching appears permissible. Verify per-site. */
  | "AUTOMATED_ALLOWED"
  /** Requires an account, or ToS restricts automated access. Human drives the browser. */
  | "MANUAL_ONLY"
  /** Official API or feed available; use credentials the candidate supplies. */
  | "API_REQUIRED"
  /** Not yet reviewed. Treated as MANUAL_ONLY until a policy decision is recorded. */
  | "UNREVIEWED";

export interface DiscoverySource {
  key: string;
  name: string;
  homepage: string;
  policy: AccessPolicy;
  /** Why the policy is what it is. Shown in the dashboard Settings view. */
  policyNote: string;
  /** Whether this source is currently switched on for discovery runs. */
  enabled: boolean;
  /** Minimum delay between requests when automated access is enabled. */
  rateLimitMs: number;
}

export const DISCOVERY_SOURCES: DiscoverySource[] = [
  {
    key: "church_site",
    name: "Church career pages",
    homepage: "",
    policy: "AUTOMATED_ALLOWED",
    policyNote:
      "Individual church careers pages are public. Fetch politely, honor robots.txt per host, and treat the church's own page as the canonical URL.",
    enabled: true,
    rateLimitMs: 2000,
  },
  {
    key: "churchstaffing",
    name: "ChurchStaffing",
    homepage: "https://www.churchstaffing.com",
    policy: "MANUAL_ONLY",
    policyNote:
      "Applications require an account and the site's terms restrict automated collection. Use the manual review workflow: the candidate browses, the agent captures postings pasted or exported into the inbox.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "vanderbloemen",
    name: "Vanderbloemen",
    homepage: "https://www.vanderbloemen.com/jobs",
    policy: "MANUAL_ONLY",
    policyNote:
      "Executive search firm. Roles are relationship-driven and often require direct contact with a search consultant; automated submission is inappropriate here regardless of technical feasibility.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "ministryjobs",
    name: "MinistryJobs.com",
    homepage: "https://www.ministryjobs.com",
    policy: "UNREVIEWED",
    policyNote: "Terms not yet reviewed. Treated as manual-only until a policy decision is recorded.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "christianjobs",
    name: "ChristianJobs",
    homepage: "https://www.christianjobs.com",
    policy: "UNREVIEWED",
    policyNote: "Terms not yet reviewed. Treated as manual-only until a policy decision is recorded.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "slingshot",
    name: "Slingshot Group",
    homepage: "https://slingshotgroup.org",
    policy: "MANUAL_ONLY",
    policyNote: "Search firm; roles run through a consultant relationship rather than a submission form.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "indeed",
    name: "Indeed",
    homepage: "https://www.indeed.com",
    policy: "MANUAL_ONLY",
    policyNote:
      "Indeed's terms prohibit automated scraping and the site actively blocks it. Do not attempt. Use saved searches and email alerts, and import results through the inbox.",
    enabled: true,
    rateLimitMs: 10000,
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    homepage: "https://www.linkedin.com/jobs",
    policy: "MANUAL_ONLY",
    policyNote:
      "Requires authentication and prohibits automated access. The candidate browses in their own logged-in session; the agent never drives an authenticated LinkedIn session.",
    enabled: true,
    rateLimitMs: 10000,
  },
  {
    key: "ziprecruiter",
    name: "ZipRecruiter",
    homepage: "https://www.ziprecruiter.com",
    policy: "MANUAL_ONLY",
    policyNote: "Account-gated with anti-bot protection. Manual review workflow only.",
    enabled: false,
    rateLimitMs: 10000,
  },
  {
    key: "denominational_board",
    name: "Denominational & network job boards",
    homepage: "",
    policy: "UNREVIEWED",
    policyNote:
      "Per-board policies vary widely. Review each board individually before enabling automated access.",
    enabled: true,
    rateLimitMs: 4000,
  },
  {
    key: "google",
    name: "Google search",
    homepage: "https://www.google.com",
    policy: "MANUAL_ONLY",
    policyNote:
      "Automated querying of the search page violates Google's terms. Use a Programmable Search API key if the candidate supplies one, otherwise search manually.",
    enabled: false,
    rateLimitMs: 10000,
  },
  {
    key: "manual",
    name: "Manual entry / inbox",
    homepage: "",
    policy: "AUTOMATED_ALLOWED",
    policyNote:
      "Postings the candidate pastes, forwards, or drops into ./inbox. Always available and always permitted.",
    enabled: true,
    rateLimitMs: 0,
  },
];

export const SOURCE_BY_KEY = new Map(DISCOVERY_SOURCES.map((s) => [s.key, s]));

/** A source may be fetched automatically only if it explicitly says so. Fails closed. */
export function mayFetchAutomatically(key: string): boolean {
  const source = SOURCE_BY_KEY.get(key);
  if (!source) return false;
  return source.enabled && source.policy === "AUTOMATED_ALLOWED";
}
