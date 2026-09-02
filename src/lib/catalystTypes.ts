/**
 * Client-safe Catalyst types and labels.
 *
 * These live apart from `src/lib/catalyst.ts` on purpose: that module reads the
 * filesystem with `fs`, so importing it from a Client Component pulls a
 * Node-only module into the browser bundle and fails the build. The portfolio
 * filter UI is a Client Component and needs the status labels, so anything it
 * touches belongs here instead.
 */

export type CatalystStatus =
  | "live"
  | "in-development"
  | "foundation-strategy"
  | "private"
  | "archived";

export type CatalystVisibility = "public" | "draft" | "private";

export const CATALYST_STATUS_LABELS: Record<CatalystStatus, string> = {
  live: "Live",
  "in-development": "In Development",
  "foundation-strategy": "Foundation & Strategy",
  private: "Private",
  archived: "Archived",
};

export interface CatalystProjectMeta {
  slug: string;
  title: string;
  client: string;
  organization: string;
  projectType: string;
  summary: string;
  challenge: string;
  approach: string;
  workCompleted: string[];
  currentStage: string;
  status: CatalystStatus;
  services: string[];
  outcomes: string[];
  year: string;
  images: { src: string; alt: string }[];
  externalUrl: string;
  visibility: CatalystVisibility;
  featured: boolean;
  displayOrder: number;
  nextPhase: string;
}
