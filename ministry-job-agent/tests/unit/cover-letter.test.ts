import { describe, expect, it } from "vitest";
import { draftCoverLetter, type CoverLetterInput } from "../../src/lib/application/cover-letter";

/**
 * The experience paragraph is the one place a drafter would be most tempted to
 * summarise a career it has not been given. These tests hold the line: with no
 * APPROVED records the paragraph stays an explicit [NEEDS:] marker, and with
 * records it cites them exactly as approved and invents nothing around them.
 */

const base: CoverLetterInput = {
  churchName: "Example Church",
  roleTitle: "Discipleship Pastor",
  lane: null,
  researchClaims: [],
  portfolioKeys: [],
  approvedFacts: { "identity.full_name": "Test Candidate" },
};

describe("cover letter — approved experience", () => {
  it("emits a NEEDS marker when no approved records exist", () => {
    const draft = draftCoverLetter(base);
    expect(draft.needs).toContain(
      "approved ministry history — the specific roles and responsibilities to cite here",
    );
    expect(draft.body).toContain("[NEEDS: approved ministry history");
  });

  it("treats an empty record list exactly like an absent one", () => {
    const draft = draftCoverLetter({ ...base, approvedExperience: [] });
    expect(draft.body).toContain("[NEEDS: approved ministry history");
  });

  it("cites approved records verbatim and drops the marker", () => {
    const draft = draftCoverLetter({
      ...base,
      approvedExperience: [
        { role: "Founder", organization: "Living Water Network", start: "2023-04", end: null },
      ],
    });
    expect(draft.body).not.toContain("[NEEDS: approved ministry history");
    expect(draft.body).toContain("Founder at Living Water Network (April 2023–present)");
    expect(draft.needs).not.toContain(
      "approved ministry history — the specific roles and responsibilities to cite here",
    );
  });

  it("renders no date span when the record states no start date", () => {
    const draft = draftCoverLetter({
      ...base,
      approvedExperience: [{ role: "Church Planter", organization: "Edgefield FCI" }],
    });
    expect(draft.body).toContain("Church Planter at Edgefield FCI.");
    expect(draft.body).not.toContain("present");
  });

  it("cites at most three roles so the letter stays a letter, not a resume", () => {
    const many = Array.from({ length: 6 }, (_, i) => ({
      role: `Role ${i}`,
      organization: `Org ${i}`,
      start: "2020",
      end: "2021",
    }));
    const draft = draftCoverLetter({ ...base, approvedExperience: many });
    expect(draft.body).toContain("Role 0");
    expect(draft.body).toContain("Role 2");
    expect(draft.body).not.toContain("Role 3");
  });
});
