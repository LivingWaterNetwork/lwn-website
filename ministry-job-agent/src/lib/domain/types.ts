import type { Classification, ClaimKind, EmploymentType } from "./enums";

/** A posting as it arrives from a discovery connector, before dedup or research. */
export interface RawPosting {
  source: string;
  sourceUrl: string;
  title: string;
  churchName: string;
  city?: string | null;
  state?: string | null;
  descriptionText?: string | null;
  canonicalUrl?: string | null;
  postedDate?: Date | null;
  deadline?: Date | null;
  employmentType?: EmploymentType | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNote?: string | null;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
}

/** A researched claim about a church, with fact and inference kept apart. */
export interface ResearchClaim {
  category: "basics" | "theology" | "ministry_philosophy" | "culture" | "position" | "compensation" | "location";
  claim: string;
  kind: ClaimKind;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  confidence?: "LOW" | "MEDIUM" | "HIGH";
}

/** Everything the scoring engine is allowed to look at. Nothing else. */
export interface ScoringInput {
  title: string;
  lane: string | null;
  laneConfidence: number;
  bodyText: string;
  responsibilities: string[];
  qualifications: string[];

  church: {
    name: string;
    denomination?: string | null;
    network?: string | null;
    onHold: boolean;
    researched: boolean;
  };

  /** Approved theology topics, and the church's stated positions where researched. */
  theology: {
    /** Topics the candidate has an APPROVED position on. */
    approvedTopics: string[];
    /** Church doctrinal signals found during research, lowercased. */
    churchSignals: string[];
    /** True when the church's statement of faith was actually located. */
    statementOfFaithFound: boolean;
  };

  cultureClaims: ResearchClaim[];

  compensation: {
    salaryMin?: number | null;
    salaryMax?: number | null;
    benefits: string[];
    housingNote?: string | null;
    relocationNote?: string | null;
  };

  location: {
    city?: string | null;
    state?: string | null;
  };

  /** Candidate credentials the posting may require. Empty until approved data exists. */
  candidate: {
    approvedCredentials: string[];
    approvedEducation: string[];
    relocationOpen: boolean;
  };

  preferences: {
    minSalary?: number | null;
    preferredSalary?: number | null;
    nationwide: boolean;
    states: string[];
  };
}

export interface DimensionScore {
  key: string;
  label: string;
  awarded: number;
  max: number;
  /** HIGH when the evidence exists; UNKNOWN when we are scoring around a gap. */
  confidence: "HIGH" | "MEDIUM" | "UNKNOWN";
  rationale: string[];
  unknowns: string[];
}

export interface RedFlag {
  code: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  message: string;
  /** What in the posting or research produced this. Red flags must be evidence-based. */
  evidence: string;
  /** CRITICAL flags force classification down regardless of numeric score. */
  overridesClassification: boolean;
}

export interface ScoreResult {
  score: number;
  classification: Classification;
  /** Classification before red-flag override, kept so the override is visible. */
  rawClassification: Classification;
  dimensions: DimensionScore[];
  redFlags: RedFlag[];
  unknowns: string[];
}
