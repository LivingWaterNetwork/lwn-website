import { describe, expect, it } from "vitest";
import { coerceDate, coerceInt, coercePosting, coerceStringArray } from "../../src/lib/imports/coerce";

/**
 * Regression: a real import batch crashed because postedDate arrived from JSON
 * as the string "2026-06-04" and Prisma requires a Date. The RawPosting type
 * claimed Date | null, but nothing enforces a type across JSON.parse.
 */
describe("date coercion", () => {
  it("converts an ISO date string to a Date", () => {
    const d = coerceDate("2026-06-04");
    expect(d).toBeInstanceOf(Date);
    expect(d!.toISOString().slice(0, 10)).toBe("2026-06-04");
  });

  it("does not shift a bare date backward across timezones", () => {
    expect(coerceDate("2026-01-01")!.toISOString().slice(0, 10)).toBe("2026-01-01");
    expect(coerceDate("2026-12-31")!.toISOString().slice(0, 10)).toBe("2026-12-31");
  });

  it("accepts a full timestamp", () => {
    expect(coerceDate("2026-06-04T12:30:00Z")).toBeInstanceOf(Date);
  });

  it("passes an existing Date through", () => {
    const d = new Date("2026-06-04");
    expect(coerceDate(d)).toBe(d);
  });

  it("returns null rather than guessing on unparseable input", () => {
    for (const bad of ["", "someday", "not a date", null, undefined, {}, [], NaN, new Date("nope")]) {
      expect(coerceDate(bad)).toBeNull();
    }
  });
});

describe("number coercion", () => {
  it("parses plain and formatted numbers", () => {
    expect(coerceInt(70000)).toBe(70000);
    expect(coerceInt("70000")).toBe(70000);
    expect(coerceInt("$70,000")).toBe(70000);
    expect(coerceInt(" 85000 ")).toBe(85000);
  });

  it("returns null on non-numeric input rather than zero", () => {
    for (const bad of ["negotiable", "DOE", "", null, undefined, {}, Infinity]) {
      expect(coerceInt(bad)).toBeNull();
    }
  });
});

describe("string array coercion", () => {
  it("keeps only non-empty strings and trims them", () => {
    expect(coerceStringArray(["  a  ", "", "b", 3, null, "   "])).toEqual(["a", "b"]);
  });

  it("returns an empty array for a non-array", () => {
    expect(coerceStringArray("a, b")).toEqual([]);
    expect(coerceStringArray(null)).toEqual([]);
  });
});

describe("posting coercion", () => {
  const valid = { title: "Discipleship Pastor", churchName: "Faith Arlington" };

  it("requires both a title and a church name", () => {
    expect(coercePosting(valid)).not.toBeNull();
    expect(coercePosting({ title: "Discipleship Pastor" })).toBeNull();
    expect(coercePosting({ churchName: "Faith Arlington" })).toBeNull();
    expect(coercePosting({ title: "  ", churchName: "X" })).toBeNull();
    expect(coercePosting(null)).toBeNull();
    expect(coercePosting("a string")).toBeNull();
  });

  it("normalizes employment type and falls back to UNKNOWN", () => {
    expect(coercePosting({ ...valid, employmentType: "full time" })!.employmentType).toBe("FULL_TIME");
    expect(coercePosting({ ...valid, employmentType: "Full-Time" })!.employmentType).toBe("FULL_TIME");
    expect(coercePosting({ ...valid, employmentType: "whatever" })!.employmentType).toBe("UNKNOWN");
    expect(coercePosting(valid)!.employmentType).toBe("UNKNOWN");
  });

  it("converts date fields so they can be persisted", () => {
    const p = coercePosting({ ...valid, postedDate: "2026-06-04", deadline: "2026-09-20" })!;
    expect(p.postedDate).toBeInstanceOf(Date);
    expect(p.deadline).toBeInstanceOf(Date);
  });

  it("leaves absent fields absent instead of inventing defaults", () => {
    const p = coercePosting(valid)!;
    expect(p.salaryMin).toBeNull();
    expect(p.salaryMax).toBeNull();
    expect(p.postedDate).toBeNull();
    expect(p.city).toBeNull();
    expect(p.descriptionText).toBeNull();
  });
});
