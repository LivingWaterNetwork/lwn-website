import { describe, expect, it } from "vitest";
import { namesMatch, computeInitials } from "@/lib/agreements/names";

describe("namesMatch", () => {
  it("matches regardless of case and extra whitespace", () => {
    expect(namesMatch("Amaya Frias", "amaya frias")).toBe(true);
    expect(namesMatch("  Amaya   Frias ", "Amaya Frias")).toBe(true);
  });

  it("rejects a different name", () => {
    expect(namesMatch("Amaya Frias", "Amaya F")).toBe(false);
    expect(namesMatch("Amaya Frias", "Omar Fandino")).toBe(false);
  });
});

describe("computeInitials", () => {
  it("derives first+last initials from a two-part name", () => {
    expect(computeInitials("Amaya Frias")).toBe("AF");
    expect(computeInitials("Omar Fandino")).toBe("OF");
  });

  it("handles extra whitespace and middle names", () => {
    expect(computeInitials("  Amaya   Rose Frias ")).toBe("AF");
  });

  it("falls back for a single-word name", () => {
    expect(computeInitials("Madonna")).toBe("MA");
  });

  it("returns empty for an empty name", () => {
    expect(computeInitials("   ")).toBe("");
  });
});
