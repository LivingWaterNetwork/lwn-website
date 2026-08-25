import { describe, expect, it } from "vitest";
import {
  dedupeKey,
  looksLikeDuplicate,
  normalizeChurchName,
  normalizeTitle,
  pickCanonicalUrl,
} from "../../src/lib/dedup/dedupe";
import type { RawPosting } from "../../src/lib/domain/types";

function posting(o: Partial<RawPosting> = {}): RawPosting {
  return {
    source: "indeed",
    sourceUrl: "https://indeed.test/a",
    title: "Young Adults Pastor",
    churchName: "Cedar Ridge Community Church",
    state: "TN",
    city: "Franklin",
    descriptionText:
      "Develop and implement the discipleship pathway for young adults in their twenties and thirties. Build a team of volunteer leaders and multiply small groups across the church.",
    ...o,
  };
}

describe("dedupe key", () => {
  it("is stable for the same job across sources", () => {
    expect(dedupeKey(posting())).toBe(dedupeKey(posting({ source: "churchstaffing" })));
  });

  it("ignores posting noise words in the title", () => {
    expect(dedupeKey(posting())).toBe(dedupeKey(posting({ title: "Young Adults Pastor - Full Time" })));
    expect(dedupeKey(posting())).toBe(dedupeKey(posting({ title: "NOW HIRING: Young Adults Pastor (Job Opening)" })));
  });

  it("ignores city differences, which boards report inconsistently", () => {
    expect(dedupeKey(posting())).toBe(dedupeKey(posting({ city: "Nashville" })));
  });

  it("distinguishes genuinely different roles at the same church", () => {
    expect(dedupeKey(posting())).not.toBe(dedupeKey(posting({ title: "Groups Pastor" })));
  });

  it("distinguishes the same title at different churches", () => {
    expect(dedupeKey(posting())).not.toBe(dedupeKey(posting({ churchName: "Northpoint Fellowship" })));
  });
});

describe("normalization", () => {
  it("normalizes church name punctuation and articles", () => {
    expect(normalizeChurchName("The Cedar Ridge Community Church, Inc.")).toBe("cedar ridge community church");
  });

  it("strips posting noise from titles", () => {
    expect(normalizeTitle("Young Adults Pastor — Full-Time Position")).toBe("young adults pastor");
  });
});

describe("similarity-based duplicate detection", () => {
  it("catches a duplicate whose title differs but description overlaps", () => {
    const v = looksLikeDuplicate(posting(), posting({ title: "Pastor of Young Adults", source: "churchstaffing" }));
    expect(v.isDuplicate).toBe(true);
  });

  it("treats an identical canonical URL as conclusive", () => {
    const a = posting({ canonicalUrl: "https://cedar.test/careers/ya" });
    const b = posting({ title: "Totally Different Title", canonicalUrl: "https://www.cedar.test/careers/ya/" });
    const v = looksLikeDuplicate(a, b);
    expect(v.isDuplicate).toBe(true);
    expect(v.confidence).toBe(1);
  });

  it("does not merge two distinct openings at one church", () => {
    const v = looksLikeDuplicate(
      posting(),
      posting({
        title: "Facilities Director",
        descriptionText: "Oversee building maintenance, grounds, custodial contracts, and campus security systems.",
      }),
    );
    expect(v.isDuplicate).toBe(false);
  });

  it("never merges across churches", () => {
    const v = looksLikeDuplicate(posting(), posting({ churchName: "Northpoint Fellowship" }));
    expect(v.isDuplicate).toBe(false);
  });

  it("handles a stub posting on one side", () => {
    const v = looksLikeDuplicate(posting(), posting({ descriptionText: "See website.", source: "indeed" }));
    expect(v.isDuplicate).toBe(true);
  });
});

describe("canonical URL selection", () => {
  it("prefers the church's own domain", () => {
    const url = pickCanonicalUrl(
      [
        { source: "indeed", url: "https://indeed.test/viewjob?jk=1" },
        { source: "churchstaffing", url: "https://churchstaffing.test/jobs/2" },
        { source: "church_site", url: "https://cedarridge.test/careers/ya" },
      ],
      "https://www.cedarridge.test",
    );
    expect(url).toBe("https://cedarridge.test/careers/ya");
  });

  it("falls back to a declared church_site source", () => {
    const url = pickCanonicalUrl(
      [
        { source: "indeed", url: "https://indeed.test/viewjob?jk=1" },
        { source: "church_site", url: "https://somechurch.test/jobs/ya" },
      ],
      null,
    );
    expect(url).toBe("https://somechurch.test/jobs/ya");
  });

  it("returns null when there are no sources", () => {
    expect(pickCanonicalUrl([], null)).toBeNull();
  });
});
