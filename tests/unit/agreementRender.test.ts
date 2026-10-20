import { describe, expect, it } from "vitest";
import {
  computeDerivedVariables,
  substituteVariables,
  fillSystemTokens,
  computeContentHash,
  markdownToSafeHtml,
  formatCurrency,
  formatDateLong,
} from "@/lib/agreements/render";

describe("formatCurrency / formatDateLong", () => {
  it("formats whole-dollar currency with commas", () => {
    expect(formatCurrency(2000)).toBe("$2,000");
    expect(formatCurrency(500)).toBe("$500");
  });

  it("formats an ISO date as a long date, UTC-safe", () => {
    expect(formatDateLong("2026-10-26")).toBe("October 26, 2026");
  });
});

describe("computeDerivedVariables", () => {
  it("derives currency and date display fields from the schema", () => {
    const derived = computeDerivedVariables(
      { total_commitment: 2000, journey_start: "2026-10-26" },
      { fields: { total_commitment: { type: "currency" }, journey_start: { type: "date" } } }
    );
    expect(derived.total_commitment_display).toBe("$2,000");
    expect(derived.journey_start_display).toBe("October 26, 2026");
    expect(derived.journey_start_weekday_display).toContain("Monday");
  });

  it("builds a markdown table from the installments field", () => {
    const derived = computeDerivedVariables(
      {
        installments: [
          { label: "First payment", due: "2026-10-28", amount: 1000 },
          { label: "Final payment", due: "2026-11-27", amount: 1000 },
        ],
      },
      { installmentsField: "installments" }
    );
    expect(derived.installments_table).toContain("| First payment | October 28, 2026 | $1,000 |");
    expect(derived.installments_table).toContain("**$2,000**");
  });
});

describe("substituteVariables", () => {
  it("fills known variables and leaves system tokens untouched", () => {
    const { body, unresolved } = substituteVariables(
      "Hello {{name}}, signed on {{system:effective_date}} by {{system:signature:participant}}.",
      { name: "Amaya Frias" }
    );
    expect(body).toBe("Hello Amaya Frias, signed on {{system:effective_date}} by {{system:signature:participant}}.");
    expect(unresolved).toEqual([]);
  });

  it("reports unresolved tokens that aren't known variables or allowed system tokens", () => {
    const { unresolved } = substituteVariables("{{known}} and {{missing}} and {{system:unknown}}", { known: "x" });
    expect(unresolved.sort()).toEqual(["missing", "system:unknown"].sort());
  });

  it("escapes markdown-significant characters in free-text values", () => {
    const { body } = substituteVariables("Business: {{biz}}", { biz: "A_B*C" });
    expect(body).toBe("Business: A\\_B\\*C");
  });

  it("inserts `_table` variables verbatim, without escaping", () => {
    const { body } = substituteVariables("{{installments_table}}", { installments_table: "| a | b |\n| - | - |" });
    expect(body).toBe("| a | b |\n| - | - |");
  });
});

describe("fillSystemTokens", () => {
  const signers = [
    { role: "participant", name: "Amaya Frias", status: "signed", signedAt: new Date("2026-10-25T15:00:00Z"), typedName: "Amaya Frias" },
    { role: "organization", name: "Omar Fandino", status: "pending", signedAt: null, typedName: null },
  ];

  it("shows a blank line for an unsigned signer", () => {
    const filled = fillSystemTokens("{{system:signature:organization}}", { effectiveDate: null, signers });
    expect(filled).toContain("_____");
  });

  it("shows the typed name and UTC timestamp for a signed signer", () => {
    const filled = fillSystemTokens("{{system:signature:participant}}", { effectiveDate: null, signers });
    expect(filled).toContain("Amaya Frias");
    expect(filled).toContain("signed");
  });

  it("leaves the effective date blank until a date is provided", () => {
    expect(fillSystemTokens("{{system:effective_date}}", { effectiveDate: null, signers })).toContain("_____");
    const d = new Date("2026-10-26T12:00:00Z");
    expect(fillSystemTokens("{{system:effective_date}}", { effectiveDate: d, signers })).toContain("October 26, 2026");
  });
});

describe("computeContentHash", () => {
  it("is deterministic and sensitive to any change", () => {
    const a = computeContentHash("hello world");
    const b = computeContentHash("hello world");
    const c = computeContentHash("hello world.");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(64);
  });
});

describe("markdownToSafeHtml", () => {
  it("renders a GFM table", () => {
    const html = markdownToSafeHtml("| A | B |\n| --- | --- |\n| 1 | 2 |\n");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("drops raw HTML instead of passing it through", () => {
    const html = markdownToSafeHtml("Hello <script>alert(1)</script> world");
    expect(html).not.toContain("<script>");
  });
});
