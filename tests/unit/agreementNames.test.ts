import { describe, expect, it } from "vitest";
import { namesMatch } from "@/lib/agreements/names";

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
