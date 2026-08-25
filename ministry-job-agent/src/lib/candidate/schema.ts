/**
 * The candidate schema.
 *
 * This is the authoritative list of what the system may know about Omar. Every
 * entry starts at NOT_PROVIDED and can only move to APPROVED by the candidate's
 * own action. There is no code path that writes a value here from inference.
 *
 * `sensitive: true` fields are excluded from anything written to disk under
 * git-tracked paths and are redacted in logs.
 */

export interface FactSpec {
  path: string;
  category: string;
  label: string;
  sensitive?: boolean;
  /** Phase 2 asks for facts in this order; lower is asked sooner. */
  priority: number;
  /** Shown in the human-input queue so the ask is unambiguous. */
  prompt?: string;
}

export const CANDIDATE_FACTS: FactSpec[] = [
  // identity
  { path: "identity.full_name", category: "identity", label: "Full legal name", priority: 1 },
  { path: "identity.preferred_name", category: "identity", label: "Preferred name", priority: 2 },
  { path: "identity.pronouns", category: "identity", label: "Pronouns", priority: 9 },

  // contact
  { path: "contact.email", category: "contact", label: "Email address", sensitive: true, priority: 1 },
  { path: "contact.phone", category: "contact", label: "Phone number", sensitive: true, priority: 1 },
  { path: "contact.mailing_address", category: "contact", label: "Mailing address", sensitive: true, priority: 6 },

  // location & relocation
  { path: "location.city", category: "location", label: "Current city", priority: 1 },
  { path: "location.state", category: "location", label: "Current state", priority: 1 },
  { path: "relocation.open_to_relocation", category: "relocation", label: "Open to relocation", priority: 1 },
  {
    path: "relocation.preferred_regions",
    category: "relocation",
    label: "Preferred regions or metros",
    priority: 7,
    prompt: "Are there regions or metros you especially want, or want to avoid? Nationwide is the current default.",
  },
  {
    path: "relocation.constraints",
    category: "relocation",
    label: "Relocation constraints",
    priority: 7,
    prompt: "Any timing, family, or logistical constraints a search team should know about?",
  },

  // salary
  {
    path: "salary.minimum",
    category: "salary",
    label: "Minimum acceptable salary",
    sensitive: true,
    priority: 4,
    prompt: "What is the lowest total compensation you would accept for a full-time role? Used to score sustainability and to flag underpaid postings.",
  },
  {
    path: "salary.preferred",
    category: "salary",
    label: "Preferred salary target",
    sensitive: true,
    priority: 4,
  },
  {
    path: "salary.expectations_statement",
    category: "salary",
    label: "Approved answer for 'salary expectations'",
    sensitive: true,
    priority: 4,
    prompt: "How would you like the system to answer 'what are your salary expectations?' on a form? The agent will never negotiate on your behalf.",
  },

  // ministry framing
  {
    path: "ministry.calling_statement",
    category: "ministry",
    label: "Statement of pastoral calling",
    priority: 3,
  },
  {
    path: "ministry.philosophy_statement",
    category: "ministry",
    label: "Ministry philosophy statement",
    priority: 3,
  },
  {
    path: "ministry.preaching_frequency",
    category: "ministry",
    label: "Preaching / teaching frequency",
    priority: 5,
    prompt: "How often have you preached or taught, and in what settings? Never estimated — only what you confirm.",
  },

  // credentials
  {
    path: "credentials.ordination_status",
    category: "credentials",
    label: "Ordination status",
    priority: 3,
    prompt: "Are you ordained, licensed, in process, or none of these? Which body?",
  },
  {
    path: "credentials.highest_education",
    category: "credentials",
    label: "Highest level of education completed",
    priority: 3,
  },

  // organizational
  {
    path: "organization.living_water_network_role",
    category: "organization",
    label: "Role with Living Water Network Inc.",
    priority: 2,
  },
  {
    path: "organization.living_water_network_founding",
    category: "organization",
    label: "Living Water Network founding history",
    priority: 2,
  },

  // links
  { path: "links.website", category: "links", label: "Personal or ministry website", priority: 5 },
  { path: "links.linkedin", category: "links", label: "LinkedIn profile", priority: 5 },
  { path: "links.preaching_samples", category: "links", label: "Preaching / teaching links", priority: 8 },
  { path: "links.portfolio", category: "links", label: "Ministry portfolio link", priority: 8 },
];

/** Repeating record kinds and the fields each entry must carry. */
export const RECORD_KINDS = {
  employment: ["employer", "title", "start", "end", "location", "summary"],
  ministry: ["organization", "role", "start", "end", "location", "summary"],
  education: ["institution", "credential", "field", "start", "end", "completed"],
  credential: ["name", "issuer", "issued", "expires", "status"],
  ordination: ["body", "type", "date", "status"],
  leadership: ["context", "description", "start", "end"],
  teaching: ["context", "description", "frequency", "start", "end"],
  metric: ["claim", "value", "context", "period"],
  skill: ["name", "context"],
  church_history: ["church", "role", "start", "end", "membership"],
  reference: ["name", "relationship", "organization", "email", "phone", "permission_to_contact"],
  link: ["label", "url"],
} as const;

export type RecordKind = keyof typeof RECORD_KINDS;

export const SENSITIVE_RECORD_KINDS: RecordKind[] = ["reference"];

/**
 * Phase 2 asks for information in this order — the minimum needed to search
 * responsibly, before the nice-to-haves.
 */
export const PHASE_2_ORDER: Array<{ group: string; description: string; paths: string[]; recordKinds: RecordKind[] }> = [
  {
    group: "Employment history",
    description: "Where you have worked, in what role, and when. Nothing is inferred from a resume until you approve it.",
    paths: [],
    recordKinds: ["employment"],
  },
  {
    group: "Ministry history",
    description: "Ministry roles, organizations, and dates — including Living Water Network.",
    paths: ["organization.living_water_network_role", "organization.living_water_network_founding"],
    recordKinds: ["ministry"],
  },
  {
    group: "Education",
    description: "Institutions, credentials, fields, and whether each was completed.",
    paths: ["credentials.highest_education"],
    recordKinds: ["education"],
  },
  {
    group: "Credentials & ordination",
    description: "Ordination, licensing, and certifications. Required by many postings.",
    paths: ["credentials.ordination_status"],
    recordKinds: ["credential", "ordination"],
  },
  {
    group: "Core theology",
    description: "Your positions on the doctrines applications actually ask about. The system will not write these for you.",
    paths: [],
    recordKinds: [],
  },
  {
    group: "Salary requirements",
    description: "Your floor and target, so compensation can be scored and underpaid roles flagged.",
    paths: ["salary.minimum", "salary.preferred", "salary.expectations_statement"],
    recordKinds: [],
  },
  {
    group: "References",
    description: "Who they are and whether you have permission to list them. The agent never contacts them.",
    paths: [],
    recordKinds: ["reference"],
  },
  {
    group: "Preaching & teaching",
    description: "Links and samples, plus how often you have taught and in what settings.",
    paths: ["links.preaching_samples", "ministry.preaching_frequency"],
    recordKinds: ["teaching"],
  },
  {
    group: "Measurable ministry experience",
    description: "Any numbers you want used. Only what you state; the system never estimates a number.",
    paths: [],
    recordKinds: ["metric", "leadership"],
  },
  {
    group: "Relocation preferences",
    description: "Regions you want, regions you would rather not, and any constraints.",
    paths: ["relocation.preferred_regions", "relocation.constraints"],
    recordKinds: [],
  },
];
