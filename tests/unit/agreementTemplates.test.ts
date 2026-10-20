import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, afterEach } from "vitest";
import {
  loadAllTemplateFiles,
  planTemplateSeed,
  TemplateLoadError,
  TemplateImmutabilityError,
  type ParsedTemplateFile,
} from "@/lib/agreements/templates";
import { sha256Hex } from "@/lib/agreements/crypto";

const tempDirs: string[] = [];

function makeFixtureDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agreement-templates-test-"));
  tempDirs.push(dir);
  for (const [relativePath, content] of Object.entries(files)) {
    const full = path.join(dir, relativePath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
  }
  return dir;
}

afterEach(() => {
  while (tempDirs.length) {
    fs.rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

const VALID_FRONTMATTER = `---
key: sample-template
version: 1.0.0
title: "Sample"
signerRoles:
  - { role: participant, label: "Participant", order: 1 }
requiredInitials: []
status: draft
---
Hello {{name}}.
`;

describe("loadAllTemplateFiles — the real shipped template", () => {
  it("parses content/agreements/lwn-coaching-business-launch/1.0.0.md without error", () => {
    const files = loadAllTemplateFiles();
    const launch = files.find((f) => f.frontmatter.key === "lwn-coaching-business-launch");
    expect(launch).toBeDefined();
    expect(launch?.frontmatter.status).toBe("published");
    expect(launch?.frontmatter.signerRoles.map((r) => r.role).sort()).toEqual(["organization", "participant", "partner"]);
    expect(launch?.frontmatter.requiredInitials.map((r) => r.section).sort()).toEqual(["10", "12", "14"]);
  });
});

describe("loadAllTemplateFiles — structural test guards", () => {
  it("throws when the frontmatter key doesn't match its directory name", () => {
    const dir = makeFixtureDir({ "wrong-dir/1.0.0.md": VALID_FRONTMATTER });
    expect(() => loadAllTemplateFiles(dir)).toThrow(TemplateLoadError);
  });

  it("throws when the frontmatter version doesn't match its filename", () => {
    const dir = makeFixtureDir({ "sample-template/2.0.0.md": VALID_FRONTMATTER });
    expect(() => loadAllTemplateFiles(dir)).toThrow(/filename/);
  });

  it("allows two different template keys to independently use the same version number", () => {
    const dir = makeFixtureDir({
      "a/1.0.0.md": VALID_FRONTMATTER.replace("key: sample-template", "key: a"),
      "b/1.0.0.md": VALID_FRONTMATTER.replace("key: sample-template", "key: b"),
    });
    const files = loadAllTemplateFiles(dir);
    expect(files.map((f) => f.frontmatter.key).sort()).toEqual(["a", "b"]);
  });

  it("rejects a version that isn't semver", () => {
    const dir = makeFixtureDir({ "sample-template/v1.md": VALID_FRONTMATTER.replace("version: 1.0.0", "version: v1") });
    expect(() => loadAllTemplateFiles(dir)).toThrow(TemplateLoadError);
  });
});

function fakeParsedFile(body: string, overrides: Partial<ParsedTemplateFile["frontmatter"]> = {}): ParsedTemplateFile {
  return {
    filePath: "/fake/path.md",
    body,
    contentSha256: sha256Hex(body),
    frontmatter: {
      key: "sample-template",
      version: "1.0.0",
      title: "Sample",
      variablesSchema: {},
      signerRoles: [{ role: "participant", label: "Participant", order: 1 }],
      requiredInitials: [],
      status: "published",
      ...overrides,
    },
  };
}

describe("planTemplateSeed — published-version immutability", () => {
  it("creates when nothing exists yet", () => {
    const plan = planTemplateSeed(fakeParsedFile("v1"), null);
    expect(plan.action).toBe("create");
  });

  it("no-ops when the file matches what's already stored", () => {
    const file = fakeParsedFile("v1");
    const plan = planTemplateSeed(file, { id: "x", status: "published", contentSha256: file.contentSha256 });
    expect(plan.action).toBe("noop");
  });

  it("throws if a published template's content hash changed on disk", () => {
    const file = fakeParsedFile("edited content");
    expect(() =>
      planTemplateSeed(file, { id: "x", status: "published", contentSha256: sha256Hex("original content") })
    ).toThrow(TemplateImmutabilityError);
  });

  it("allows updating a draft in place", () => {
    const file = fakeParsedFile("v2", { status: "draft" });
    const plan = planTemplateSeed(file, { id: "x", status: "draft", contentSha256: sha256Hex("v1") });
    expect(plan).toEqual({ action: "update", id: "x" });
  });
});
