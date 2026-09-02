// Types mirror the schema of 03-PROJECT-REGISTRY.json. If a field is missing or
// wrong, fix the registry — never hand-author project facts in a component.

export type ProjectStatus =
  "Live" | "In Development" | "Foundation & Strategy" | "Archived";

export type ProjectVisibility = "Public" | "Draft" | "Private";

export type CapabilityName =
  | "Strategy & Organizational Architecture"
  | "Websites & Digital Platforms"
  | "Operations, AI & Automation"
  | "Initiatives & Program Launches";

export interface ProjectRecord {
  title: string;
  slug: string;
  organizationOrClient: string;
  projectType: string;
  publicSummary: string;
  challenge: string;
  approach: string;
  workCompleted: string;
  currentStage: string;
  status: ProjectStatus;
  services: CapabilityName[];
  verifiedOutcomes: string[];
  year: string;
  approvedImages: string[];
  externalUrl: string | null;
  visibility: ProjectVisibility;
  featured: boolean;
  displayOrder: number;
  nextPhase: string;
  claimsRequiringVerification: string[];
  publicationApprovalStatus: string;
}

/**
 * A record that has cleared the Public + Approved gate in `projects.ts`. Only
 * this type may be handed to a component, a route, or a client payload.
 */
export type PublicProject = ProjectRecord & {
  visibility: "Public";
};
