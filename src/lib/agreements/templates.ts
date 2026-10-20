import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { sha256Hex } from "./crypto";

const CONTENT_ROOT = path.join(process.cwd(), "content", "agreements");

const signerRoleSchema = z.object({
  role: z.enum(["partner", "participant", "organization"]),
  label: z.string().min(1),
  /** Workflow order signers act in (e.g. partner accepts before send, participant signs, organization countersigns last) — independent of where each signature block visually appears in the document. */
  order: z.number().int().positive(),
  requiredBeforeSend: z.boolean().optional(),
});

const variablesSchemaSchema = z
  .object({
    fields: z.record(z.string(), z.object({ type: z.enum(["currency", "date"]) })).optional(),
    installmentsField: z.string().optional(),
  })
  .passthrough();

export const templateFrontmatterSchema = z.object({
  key: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "version must be semver, e.g. 1.0.0"),
  title: z.string().min(1),
  variablesSchema: variablesSchemaSchema.default({}),
  signerRoles: z.array(signerRoleSchema).min(1),
  requiredInitials: z
    .array(
      z.object({
        /** Leading section number as it appears in the body heading, e.g. "10" for "## 10. Payment...". */
        section: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .default([]),
  status: z.enum(["draft", "published", "retired"]).default("draft"),
});

export type TemplateFrontmatter = z.infer<typeof templateFrontmatterSchema>;

export type ParsedTemplateFile = {
  filePath: string;
  frontmatter: TemplateFrontmatter;
  body: string;
  contentSha256: string;
};

export class TemplateLoadError extends Error {}

/**
 * Reads and validates every `<root>/<key>/<version>.md` file (default root:
 * `content/agreements/`). Throws on any structural problem — a build/test
 * guard, not a runtime path. `root` is overridable so tests can point this at
 * a fixture directory without touching the real template content.
 */
export function loadAllTemplateFiles(root: string = CONTENT_ROOT): ParsedTemplateFile[] {
  if (!fs.existsSync(root)) return [];

  const results: ParsedTemplateFile[] = [];
  const seenKeyVersions = new Map<string, string>();

  const templateKeys = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const keyDir of templateKeys) {
    const keyPath = path.join(root, keyDir.name);
    const files = fs.readdirSync(keyPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const filePath = path.join(keyPath, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);

      const parsed = templateFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        throw new TemplateLoadError(
          `${filePath}: invalid frontmatter — ${parsed.error.issues.map((i) => i.message).join("; ")}`
        );
      }
      const frontmatter = parsed.data;

      if (frontmatter.key !== keyDir.name) {
        throw new TemplateLoadError(
          `${filePath}: frontmatter key "${frontmatter.key}" must match its directory name "${keyDir.name}"`
        );
      }
      const expectedFileName = `${frontmatter.version}.md`;
      if (file !== expectedFileName) {
        throw new TemplateLoadError(
          `${filePath}: frontmatter version "${frontmatter.version}" must match its filename "${expectedFileName}"`
        );
      }

      const dedupeKey = `${frontmatter.key}@${frontmatter.version}`;
      const existing = seenKeyVersions.get(dedupeKey);
      if (existing) {
        throw new TemplateLoadError(
          `Duplicate template key+version "${dedupeKey}" found in both ${existing} and ${filePath}`
        );
      }
      seenKeyVersions.set(dedupeKey, filePath);

      const body = content.trim();
      results.push({ filePath, frontmatter, body, contentSha256: sha256Hex(body) });
    }
  }

  return results;
}

export class TemplateImmutabilityError extends Error {}

/** A minimal shape of the fields we need from the DB row, so this module has no Prisma import (keeps it usable from scripts and tests alike). */
export type ExistingTemplateRow = {
  id: string;
  status: string;
  contentSha256: string;
};

/**
 * Enforces: a published template version is immutable. If a template with
 * this key+version already exists in the DB and is published, its stored
 * hash must match the file's current hash — otherwise someone edited a
 * published version in place, which must instead be shipped as a new
 * version. Returns the action the seeder should take.
 */
export function planTemplateSeed(
  file: ParsedTemplateFile,
  existing: ExistingTemplateRow | null
): { action: "create" } | { action: "update"; id: string } | { action: "noop" } {
  if (!existing) return { action: "create" };

  if (existing.status === "published" && existing.contentSha256 !== file.contentSha256) {
    throw new TemplateImmutabilityError(
      `${file.frontmatter.key}@${file.frontmatter.version} is published but its content hash changed ` +
        `(stored ${existing.contentSha256.slice(0, 12)}… vs file ${file.contentSha256.slice(0, 12)}…). ` +
        `Published versions are immutable — bump the version instead of editing this file.`
    );
  }

  if (existing.contentSha256 === file.contentSha256 && existing.status === file.frontmatter.status) {
    return { action: "noop" };
  }

  return { action: "update", id: existing.id };
}
