import fs from "fs";
import path from "path";
import { z } from "zod";
import { sha256Hex } from "./crypto";
import { MODULES_AVAILABLE } from "./constants";

const CONTENT_ROOT = path.join(process.cwd(), "content", "programs");

const phaseSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  weekRange: z.string().min(1),
  summary: z.string().min(1),
});

const defaultStepSchema = z.object({
  title: z.string().min(1),
  detail: z.string().optional(),
  phaseKey: z.string().min(1).optional(),
  dayOffset: z.number().int().min(0),
  tags: z.array(z.string()).default([]),
});

const defaultDocumentSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["agreement", "worksheet", "curriculum", "brand_website", "other"]),
});

export const programTemplateBodySchema = z.object({
  key: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "version must be semver, e.g. 1.0.0"),
  title: z.string().min(1),
  status: z.enum(["draft", "published", "retired"]).default("draft"),
  lengthDays: z.number().int().positive(),
  phases: z.array(phaseSchema).min(1),
  expectedSessions: z.object({
    count: z.number().int().positive(),
    durationMin: z.number().int().positive(),
  }),
  defaultSteps: z.array(defaultStepSchema).default([]),
  defaultLibraryDocuments: z.array(defaultDocumentSchema).default([]),
  // Validated against MODULES_AVAILABLE only when a module is actually read
  // at enrollment time (lib/portal/constants.ts isModuleAvailable) — not
  // here, so a draft template can list a Phase 2/3 module key ahead of the
  // code that reads it without failing to load.
  modules: z.array(z.string()).default([]),
  agreementTemplateKey: z.string().optional(),
  defaultPaymentUrl: z.string().url().optional(),
});

export type ProgramTemplateBody = z.infer<typeof programTemplateBodySchema>;

export type ParsedProgramTemplateFile = {
  filePath: string;
  body: ProgramTemplateBody;
  sha256: string;
};

export class ProgramTemplateLoadError extends Error {}

/**
 * Reads and validates every `<root>/<key>/<version>.json` file (default
 * root: `content/programs/`). Mirrors loadAllTemplateFiles in
 * lib/agreements/templates.ts: directory name must equal the file's own
 * `key`, filename must equal `<version>.json`, no duplicate key+version.
 */
export function loadAllProgramTemplateFiles(root: string = CONTENT_ROOT): ParsedProgramTemplateFile[] {
  if (!fs.existsSync(root)) return [];

  const results: ParsedProgramTemplateFile[] = [];
  const seenKeyVersions = new Map<string, string>();

  const keyDirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const keyDir of keyDirs) {
    const keyPath = path.join(root, keyDir.name);
    const files = fs.readdirSync(keyPath).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(keyPath, file);
      const raw = fs.readFileSync(filePath, "utf8");

      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch (err) {
        throw new ProgramTemplateLoadError(`${filePath}: invalid JSON — ${err instanceof Error ? err.message : err}`);
      }

      const parsed = programTemplateBodySchema.safeParse(json);
      if (!parsed.success) {
        throw new ProgramTemplateLoadError(
          `${filePath}: invalid template — ${parsed.error.issues.map((i) => i.message).join("; ")}`
        );
      }
      const body = parsed.data;

      if (body.key !== keyDir.name) {
        throw new ProgramTemplateLoadError(
          `${filePath}: body key "${body.key}" must match its directory name "${keyDir.name}"`
        );
      }
      const expectedFileName = `${body.version}.json`;
      if (file !== expectedFileName) {
        throw new ProgramTemplateLoadError(
          `${filePath}: body version "${body.version}" must match its filename "${expectedFileName}"`
        );
      }

      const dedupeKey = `${body.key}@${body.version}`;
      const existing = seenKeyVersions.get(dedupeKey);
      if (existing) {
        throw new ProgramTemplateLoadError(
          `Duplicate template key+version "${dedupeKey}" found in both ${existing} and ${filePath}`
        );
      }
      seenKeyVersions.set(dedupeKey, filePath);

      results.push({ filePath, body, sha256: sha256Hex(raw.trim()) });
    }
  }

  return results;
}

export class ProgramTemplateImmutabilityError extends Error {}

export type ExistingProgramTemplateRow = { id: string; status: string; sha256: string };

/** Same immutability rule as Agreements templates: a published version's file content can never change in place. */
export function planProgramTemplateSeed(
  file: ParsedProgramTemplateFile,
  existing: ExistingProgramTemplateRow | null
): { action: "create" } | { action: "update"; id: string } | { action: "noop" } {
  if (!existing) return { action: "create" };

  if (existing.status === "published" && existing.sha256 !== file.sha256) {
    throw new ProgramTemplateImmutabilityError(
      `${file.body.key}@${file.body.version} is published but its content changed ` +
        `(stored ${existing.sha256.slice(0, 12)}… vs file ${file.sha256.slice(0, 12)}…). ` +
        `Published versions are immutable — ship a new version instead of editing this file.`
    );
  }

  if (existing.sha256 === file.sha256 && existing.status === file.body.status) {
    return { action: "noop" };
  }

  return { action: "update", id: existing.id };
}

/** Modules a template declares that lib/portal/constants.ts doesn't (yet) know how to render — surfaced so a draft can reference a future-phase module key without silently losing it. */
export function unknownModules(body: ProgramTemplateBody): string[] {
  const known = new Set<string>(MODULES_AVAILABLE);
  return body.modules.filter((m) => !known.has(m));
}
