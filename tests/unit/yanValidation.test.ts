import { describe, expect, it } from "vitest";
import {
  yanJoinSchema,
  yanEventRegistrationSchema,
  yanPrayerRequestSchema,
  yanGroupSuggestionSchema,
  yanResourceSubmissionSchema,
  yanStorySubmissionSchema,
  yanLeaderNominationSchema,
  yanSubscribeSchema,
  isHoneypotTripped,
} from "@/lib/yanValidation";

describe("yanJoinSchema", () => {
  it("accepts a minimal valid submission", () => {
    const result = yanJoinSchema.safeParse({
      pathway: "find-community",
      name: "Jamie Lee",
      email: "jamie@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown pathway", () => {
    const result = yanJoinSchema.safeParse({ pathway: "not-a-real-pathway", name: "Jamie", email: "jamie@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = yanJoinSchema.safeParse({ pathway: "updates", name: "Jamie" });
    expect(result.success).toBe(false);
  });
});

describe("yanEventRegistrationSchema", () => {
  it("requires an eventId", () => {
    const result = yanEventRegistrationSchema.safeParse({ name: "Jamie", email: "jamie@example.com" });
    expect(result.success).toBe(false);
  });

  it("accepts a full registration", () => {
    const result = yanEventRegistrationSchema.safeParse({
      eventId: "evt_123",
      name: "Jamie Lee",
      email: "jamie@example.com",
      organization: "First Church",
    });
    expect(result.success).toBe(true);
  });
});

describe("yanPrayerRequestSchema", () => {
  it("defaults to private visibility and no follow-up", () => {
    const result = yanPrayerRequestSchema.parse({ requestText: "Please pray for my family." });
    expect(result.visibility).toBe("private");
    expect(result.allowFollowUp).toBe(false);
  });

  it("rejects an empty request", () => {
    const result = yanPrayerRequestSchema.safeParse({ requestText: "" });
    expect(result.success).toBe(false);
  });
});

describe("yanGroupSuggestionSchema", () => {
  it("requires a description", () => {
    const result = yanGroupSuggestionSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      groupName: "Midtown Young Adults",
      description: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("yanResourceSubmissionSchema", () => {
  it("rejects an invalid resourceType", () => {
    const result = yanResourceSubmissionSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      title: "Small Group Guide",
      resourceType: "not-a-type",
      description: "A guide for small groups.",
    });
    expect(result.success).toBe(false);
  });
});

describe("yanStorySubmissionSchema", () => {
  it("requires consent to be explicitly true", () => {
    const result = yanStorySubmissionSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      title: "How our groups connected",
      storyType: "testimony",
      body: "It was a great year.",
      consentGiven: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a submission with consent given", () => {
    const result = yanStorySubmissionSchema.safeParse({
      name: "Jamie",
      email: "jamie@example.com",
      title: "How our groups connected",
      storyType: "testimony",
      body: "It was a great year.",
      consentGiven: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("yanLeaderNominationSchema", () => {
  it("requires nominator consent confirmation", () => {
    const result = yanLeaderNominationSchema.safeParse({
      name: "Pastor Jamie",
      bio: "Leads a thriving young-adult ministry.",
      nominatedByName: "A Friend",
      nominatedByEmail: "friend@example.com",
      consentGiven: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("yanSubscribeSchema", () => {
  it("requires a valid email", () => {
    expect(yanSubscribeSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(yanSubscribeSchema.safeParse({ email: "person@example.com" }).success).toBe(true);
  });
});

describe("isHoneypotTripped", () => {
  it("flags a filled honeypot as a bot", () => {
    expect(isHoneypotTripped({ website: "http://spam.example" })).toBe(true);
  });

  it("treats an empty honeypot as a real visitor", () => {
    expect(isHoneypotTripped({ website: "" })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
  });
});
