/**
 * Discovery source registry.
 *
 * Every source declares two SEPARATE policies, because reading a public job
 * listing and submitting an application through a site are different acts with
 * different constraints:
 *
 *   - `discoveryPolicy`  — may the agent READ listings from this source?
 *   - `applicationPolicy` — may an application be SUBMITTED through it?
 *
 * These were originally one field, and collapsing them cost real coverage. The
 * search firms were marked manual-only with the note "automated submission is
 * inappropriate here" — which is true, and was never a reason not to read their
 * public listings. A source can be perfectly readable and still be somewhere a
 * human must do the applying.
 *
 * Both fail closed: anything not explicitly allowed is treated as requiring a
 * human. Nothing here bypasses authentication, rate limits, robots directives,
 * or anti-bot systems. A 403 is a decision, not an obstacle — record it and
 * move on rather than retrying with different headers.
 *
 * Policies below are conservative defaults, not legal advice. Record decisions
 * and observed responses in docs/source-policies.md.
 */

export type DiscoveryPolicy =
  /** Public listings, no login. Politely fetchable. */
  | "READABLE"
  /** Index pages block automated reads, but individual postings are readable. */
  | "READABLE_BY_POSTING"
  /** Requires an account, or blocks automated reads. Human browses. */
  | "MANUAL_ONLY"
  /** Not yet assessed. Treated as MANUAL_ONLY. */
  | "UNREVIEWED";

export type ApplicationPolicy =
  /** A form the agent may fill as a draft, still stopping before submit. */
  | "ASSISTED_DRAFT"
  /** Human must drive the whole application (login, consultant relationship). */
  | "MANUAL_ONLY"
  /** Applying means contacting a person, not filling a form. */
  | "RELATIONSHIP_DRIVEN";

export interface DiscoverySource {
  key: string;
  name: string;
  homepage: string;
  discoveryPolicy: DiscoveryPolicy;
  applicationPolicy: ApplicationPolicy;
  /** Why the policies are what they are. Shown in the dashboard Settings view. */
  policyNote: string;
  /** Whether this source is currently switched on for discovery runs. */
  enabled: boolean;
  /** Minimum delay between requests when reading is permitted. */
  rateLimitMs: number;
  /** Observed HTTP behavior, recorded so we stop re-testing a known block. */
  observed?: string;
}

export const DISCOVERY_SOURCES: DiscoverySource[] = [
  {
    key: "church_site",
    name: "Church career pages",
    homepage: "",
    discoveryPolicy: "READABLE",
    applicationPolicy: "ASSISTED_DRAFT",
    policyNote:
      "Individual church careers pages are public. Fetch politely, honor robots.txt per host, and treat the church's own page as the canonical URL.",
    enabled: true,
    rateLimitMs: 2000,
  },
  {
    key: "manual",
    name: "Manual entry / inbox",
    homepage: "",
    discoveryPolicy: "READABLE",
    applicationPolicy: "ASSISTED_DRAFT",
    policyNote: "Postings the candidate pastes, forwards, or drops into ./inbox. Always permitted.",
    enabled: true,
    rateLimitMs: 0,
  },
  {
    key: "denominational_board",
    name: "Seminary & denominational job boards",
    homepage: "https://jobboard.denverseminary.edu",
    discoveryPolicy: "READABLE",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Seminary boards (Denver Seminary, Kairos, Regent) publish listings openly and exist to connect candidates with churches. Readable. Applications route to each church's own process.",
    enabled: true,
    rateLimitMs: 3000,
    observed: "Denver Seminary and Kairos serve category and listing pages normally.",
  },
  {
    key: "chemistrystaffing",
    name: "Chemistry Staffing",
    homepage: "https://www.chemistrystaffing.com",
    discoveryPolicy: "READABLE_BY_POSTING",
    applicationPolicy: "RELATIONSHIP_DRIVEN",
    policyNote:
      "Individual /job/ pages render server-side and are readable. The /jobs/ index is JavaScript-driven and returns no listings to a plain fetch. Applications go through Chemistry's own placement process, not the church directly.",
    enabled: true,
    rateLimitMs: 4000,
    observed: "Individual postings 200. Index page returns a search shell; job-sitemap.xml 404.",
  },
  {
    key: "justchurchjobs",
    name: "JustChurchJobs",
    homepage: "https://justchurchjobs.com",
    discoveryPolicy: "READABLE",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Position category pages and individual postings are publicly readable. Applications route to each church's own portal or email.",
    enabled: true,
    rateLimitMs: 3000,
    observed: "Category and job pages 200.",
  },
  {
    key: "ministryhub",
    name: "MinistryHub",
    homepage: "https://jobs.ministryhub.org",
    discoveryPolicy: "READABLE",
    applicationPolicy: "MANUAL_ONLY",
    policyNote: "Public listing pages readable. Applications go through each church's stated method.",
    enabled: true,
    rateLimitMs: 3000,
    observed: "Listing and job pages 200.",
  },
  {
    key: "vanderbloemen",
    name: "Vanderbloemen",
    homepage: "https://www.vanderbloemen.com/jobs",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "RELATIONSHIP_DRIVEN",
    policyNote:
      "Executive search firm. Their site returns 403 to automated reads at both the index and individual postings, so the candidate browses it directly. Roles here move through a search consultant; a form submission is not the path in anyway.",
    enabled: true,
    rateLimitMs: 5000,
    observed: "403 Forbidden on /jobs and on individual /job/ pages.",
  },
  {
    key: "slingshot",
    name: "Slingshot Group",
    homepage: "https://slingshotgroup.org",
    discoveryPolicy: "UNREVIEWED",
    applicationPolicy: "RELATIONSHIP_DRIVEN",
    policyNote:
      "Search firm. No public listings index was located; their openings surface through partner boards. Roles run through a consultant relationship.",
    enabled: true,
    rateLimitMs: 5000,
    observed: "/searches/ 404. No readable listings index found.",
  },
  {
    key: "churchjobs",
    name: "ChurchJobs.net",
    homepage: "https://www.churchjobs.net",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote: "Returns 403 to automated reads. The candidate browses directly and exports to ./inbox.",
    enabled: true,
    rateLimitMs: 5000,
    observed: "403 Forbidden on category pages.",
  },
  {
    key: "ministryjobs",
    name: "MinistryJobs.com",
    homepage: "https://www.ministryjobs.com",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote: "Listings are rendered client-side and are not present in a plain fetch.",
    enabled: true,
    rateLimitMs: 5000,
    observed: "Page loads but contains no listings without JavaScript.",
  },
  {
    key: "indeed",
    name: "Indeed",
    homepage: "https://www.indeed.com",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Terms prohibit automated scraping and the site actively blocks it. Not attempted. Use saved searches and email alerts, and import results through ./inbox.",
    enabled: true,
    rateLimitMs: 10000,
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    homepage: "https://www.linkedin.com/jobs",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Requires authentication for anything beyond a teaser and the User Agreement prohibits automated access. Not attempted. The candidate browses in their own signed-in session; the agent never drives an authenticated LinkedIn session or handles those credentials. Export or paste results into ./inbox.",
    enabled: true,
    rateLimitMs: 10000,
  },
  {
    key: "churchstaffing",
    name: "ChurchStaffing",
    homepage: "https://www.churchstaffing.com",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Account required and terms restrict automated collection. Holds real volume in the candidate's lanes, so this is the highest-value board for him to browse manually and export.",
    enabled: true,
    rateLimitMs: 5000,
  },
  {
    key: "ziprecruiter",
    name: "ZipRecruiter",
    homepage: "https://www.ziprecruiter.com",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote: "Account-gated with anti-bot protection. Manual review workflow only.",
    enabled: false,
    rateLimitMs: 10000,
  },
  {
    key: "google",
    name: "Google search",
    homepage: "https://www.google.com",
    discoveryPolicy: "MANUAL_ONLY",
    applicationPolicy: "MANUAL_ONLY",
    policyNote:
      "Automated querying of the search page violates Google's terms. A Programmable Search API key would be a permitted path if the candidate supplies one.",
    enabled: false,
    rateLimitMs: 10000,
  },
];

export const SOURCE_BY_KEY = new Map(DISCOVERY_SOURCES.map((s) => [s.key, s]));

/** May the agent read listings from this source? Fails closed on unknown keys. */
export function mayReadListings(key: string): boolean {
  const source = SOURCE_BY_KEY.get(key);
  if (!source) return false;
  return source.enabled && (source.discoveryPolicy === "READABLE" || source.discoveryPolicy === "READABLE_BY_POSTING");
}

/** May an application be drafted through this source's form? Fails closed. */
export function mayDraftApplication(key: string): boolean {
  const source = SOURCE_BY_KEY.get(key);
  if (!source) return false;
  return source.enabled && source.applicationPolicy === "ASSISTED_DRAFT";
}

/**
 * Back-compat alias. Discovery is the question every existing caller was really
 * asking; submission has always been gated separately by the approval gate.
 */
export const mayFetchAutomatically = mayReadListings;
