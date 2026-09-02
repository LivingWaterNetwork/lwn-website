import fs from "fs";
import path from "path";
import matter from "gray-matter";

const workDirectory = path.join(process.cwd(), "content/catalyst-work");

// Types and labels live in a separate, fs-free module so Client Components can
// import them without pulling this file's `fs` usage into the browser bundle.
export type {
  CatalystStatus,
  CatalystVisibility,
  CatalystProjectMeta,
} from "./catalystTypes";
export { CATALYST_STATUS_LABELS } from "./catalystTypes";

import type {
  CatalystProjectMeta,
  CatalystStatus,
  CatalystVisibility,
} from "./catalystTypes";

const VALID_STATUSES: CatalystStatus[] = [
  "live",
  "in-development",
  "foundation-strategy",
  "private",
  "archived",
];

const VALID_VISIBILITIES: CatalystVisibility[] = ["public", "draft", "private"];

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function toImages(value: unknown): { src: string; alt: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { src: item, alt: "" };
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        return { src: String(rec.src ?? ""), alt: String(rec.alt ?? "") };
      }
      return { src: "", alt: "" };
    })
    .filter((img) => img.src.length > 0);
}

/**
 * Anything unrecognised or missing falls back to the most restrictive value.
 * A typo in `visibility` therefore hides a project rather than publishing it.
 */
function normalizeMeta(slug: string, data: Record<string, unknown>): CatalystProjectMeta {
  const rawStatus = String(data.status ?? "");
  const rawVisibility = String(data.visibility ?? "");

  return {
    slug,
    title: String(data.title ?? "Untitled Project"),
    client: String(data.client ?? ""),
    organization: String(data.organization ?? ""),
    projectType: String(data.projectType ?? ""),
    summary: String(data.summary ?? ""),
    challenge: String(data.challenge ?? ""),
    approach: String(data.approach ?? ""),
    workCompleted: toStringArray(data.workCompleted),
    currentStage: String(data.currentStage ?? ""),
    status: VALID_STATUSES.includes(rawStatus as CatalystStatus)
      ? (rawStatus as CatalystStatus)
      : "in-development",
    services: toStringArray(data.services),
    outcomes: toStringArray(data.outcomes),
    year: String(data.year ?? ""),
    images: toImages(data.images),
    externalUrl: String(data.externalUrl ?? ""),
    visibility: VALID_VISIBILITIES.includes(rawVisibility as CatalystVisibility)
      ? (rawVisibility as CatalystVisibility)
      : "private",
    featured: data.featured === true,
    displayOrder: Number.isFinite(Number(data.displayOrder)) ? Number(data.displayOrder) : 999,
    nextPhase: String(data.nextPhase ?? ""),
  };
}

function readAll(): { meta: CatalystProjectMeta; content: string }[] {
  if (!fs.existsSync(workDirectory)) return [];

  return fs
    .readdirSync(workDirectory)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(workDirectory, filename), "utf8");
      const { data, content } = matter(raw);
      return { meta: normalizeMeta(slug, data as Record<string, unknown>), content };
    });
}

/**
 * The single public read path. Every consumer — pages, metadata, sitemap,
 * JSON-LD — goes through here, so a non-public project cannot leak.
 */
export function getAllProjects(): CatalystProjectMeta[] {
  return readAll()
    .map(({ meta }) => meta)
    .filter((meta) => meta.visibility === "public")
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title));
}

export function getFeaturedProjects(limit = 3): CatalystProjectMeta[] {
  const all = getAllProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

/** Returns null for any slug that isn't a published project — callers should `notFound()`. */
export function getProjectBySlug(
  slug: string
): { meta: CatalystProjectMeta; content: string } | null {
  const match = readAll().find((entry) => entry.meta.slug === slug);
  if (!match || match.meta.visibility !== "public") return null;
  return match;
}

export function getRelatedProjects(slug: string, limit = 2): CatalystProjectMeta[] {
  return getAllProjects()
    .filter((p) => p.slug !== slug)
    .slice(0, limit);
}

/** Distinct project types across published work, for the portfolio filter controls. */
export function getProjectTypes(): string[] {
  return Array.from(new Set(getAllProjects().map((p) => p.projectType).filter(Boolean))).sort();
}

/** Distinct statuses across published work, in a stable display order. */
export function getProjectStatuses(): CatalystStatus[] {
  const present = new Set(getAllProjects().map((p) => p.status));
  return VALID_STATUSES.filter((s) => present.has(s));
}
