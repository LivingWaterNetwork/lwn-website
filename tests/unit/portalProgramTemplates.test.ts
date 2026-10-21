import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  loadAllProgramTemplateFiles,
  planProgramTemplateSeed,
  ProgramTemplateImmutabilityError,
  ProgramTemplateLoadError,
  unknownModules,
} from "../../src/lib/portal/programTemplates";

describe("loadAllProgramTemplateFiles — real shipped content", () => {
  it("loads every shipped template without throwing", () => {
    const files = loadAllProgramTemplateFiles();
    expect(files.length).toBeGreaterThanOrEqual(5);
    const keys = files.map((f) => f.body.key);
    expect(keys).toContain("lwn-coaching-business-launch-60");
    expect(keys).toContain("lwn-personal-coaching");
  });

  it("the 60-day coaching template is published and links the matching agreement template", () => {
    const files = loadAllProgramTemplateFiles();
    const file = files.find((f) => f.body.key === "lwn-coaching-business-launch-60")!;
    expect(file.body.status).toBe("published");
    expect(file.body.agreementTemplateKey).toBe("lwn-coaching-business-launch");
    expect(file.body.modules).toContain("business_launch");
  });

  it("the groundwork cohort draft declares a module the app doesn't know how to render yet", () => {
    const files = loadAllProgramTemplateFiles();
    const file = files.find((f) => f.body.key === "lwn-groundwork-cohort")!;
    expect(unknownModules(file.body)).toContain("cohort");
  });
});

describe("loadAllProgramTemplateFiles — fixtures", () => {
  let tmpRoot: string;

  beforeAll(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "portal-templates-"));
  });

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  function writeFixture(key: string, version: string, body: Record<string, unknown>) {
    const dir = path.join(tmpRoot, key);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${version}.json`), JSON.stringify(body, null, 2));
  }

  const baseBody = {
    title: "Test Program",
    status: "draft",
    lengthDays: 30,
    phases: [{ key: "see", title: "See", weekRange: "Week 1", summary: "s" }],
    expectedSessions: { count: 1, durationMin: 60 },
  };

  it("throws when the directory name doesn't match the body's key", () => {
    writeFixture("wrong-dir", "1.0.0", { ...baseBody, key: "right-key", version: "1.0.0" });
    expect(() => loadAllProgramTemplateFiles(tmpRoot)).toThrow(ProgramTemplateLoadError);
  });

  it("throws when the filename doesn't match the body's version", () => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.mkdirSync(tmpRoot);
    const dir = path.join(tmpRoot, "some-key");
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, "2.0.0.json"), JSON.stringify({ ...baseBody, key: "some-key", version: "1.0.0" }));
    expect(() => loadAllProgramTemplateFiles(tmpRoot)).toThrow(ProgramTemplateLoadError);
  });

  it("throws on invalid JSON", () => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.mkdirSync(tmpRoot);
    const dir = path.join(tmpRoot, "broken");
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, "1.0.0.json"), "{ not json");
    expect(() => loadAllProgramTemplateFiles(tmpRoot)).toThrow(ProgramTemplateLoadError);
  });
});

describe("planProgramTemplateSeed", () => {
  // Only key/version/status/sha256 are actually read by planProgramTemplateSeed.
  const file = {
    filePath: "x",
    body: { key: "test", version: "1.0.0", status: "draft" },
    sha256: "abc123",
  } as unknown as Parameters<typeof planProgramTemplateSeed>[0];

  it("creates when nothing exists yet", () => {
    expect(planProgramTemplateSeed(file, null)).toEqual({ action: "create" });
  });

  it("is a noop when hash and status both match", () => {
    expect(planProgramTemplateSeed(file, { id: "1", status: "draft", sha256: "abc123" })).toEqual({ action: "noop" });
  });

  it("updates a draft in place when the hash changed", () => {
    expect(planProgramTemplateSeed(file, { id: "1", status: "draft", sha256: "different" })).toEqual({
      action: "update",
      id: "1",
    });
  });

  it("throws TemplateImmutabilityError when a published version's hash changed", () => {
    expect(() => planProgramTemplateSeed(file, { id: "1", status: "published", sha256: "different" })).toThrow(
      ProgramTemplateImmutabilityError
    );
  });
});
