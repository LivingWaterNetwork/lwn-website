import { describe, expect, it } from "vitest";
import { bucketSteps } from "../../src/lib/portal/stepBuckets";

describe("bucketSteps", () => {
  const now = new Date(2026, 9, 21, 12, 0, 0); // Oct 21, 2026, local time

  it("buckets a done step regardless of due date", () => {
    const result = bucketSteps([{ status: "done", dueOn: "2026-10-01T00:00:00.000Z" }], now);
    expect(result.done).toHaveLength(1);
    expect(result.overdue).toHaveLength(0);
  });

  it("buckets an open step with no due date as noDate", () => {
    const result = bucketSteps([{ status: "open", dueOn: null }], now);
    expect(result.noDate).toHaveLength(1);
  });

  it("buckets a past-due open step as overdue", () => {
    const yesterday = new Date(2026, 9, 20, 9, 0, 0).toISOString();
    const result = bucketSteps([{ status: "open", dueOn: yesterday }], now);
    expect(result.overdue).toHaveLength(1);
  });

  it("buckets a step due today or within 7 days as thisWeek", () => {
    const inThreeDays = new Date(2026, 9, 24, 9, 0, 0).toISOString();
    const result = bucketSteps([{ status: "open", dueOn: inThreeDays }], now);
    expect(result.thisWeek).toHaveLength(1);
  });

  it("buckets a step due beyond 7 days as later", () => {
    const inTenDays = new Date(2026, 10, 1, 9, 0, 0).toISOString();
    const result = bucketSteps([{ status: "open", dueOn: inTenDays }], now);
    expect(result.later).toHaveLength(1);
  });
});
