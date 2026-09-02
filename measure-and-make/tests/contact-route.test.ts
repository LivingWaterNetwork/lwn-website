import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";
import { HONEYPOT_FIELD } from "@/lib/contact-schema";

// The contact route must never report a success it did not achieve, and must
// never let an unvalidated or bot submission through.

const VALID = {
  name: "Jordan Reyes",
  organization: "Cedar Street Church",
  email: "jordan@example.org",
  phone: "",
  website: "cedarstreet.example.org",
  organizationType: "Church / Ministry",
  interests: ["Websites & Digital Platforms"],
  timeline: "Next 1-3 months",
  budget: "$5,000-$15,000",
  message: "We need to replace a site nobody can edit.",
  [HONEYPOT_FIELD]: "",
};

function post(body: unknown, ip: string) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );
}

let counter = 0;
const nextIp = () => `10.0.0.${++counter % 240}`;

beforeEach(() => {
  vi.stubEnv("AIRTABLE_API_KEY", "pat_test");
  vi.stubEnv("AIRTABLE_BASE_ID", "appKznUQ11agoIbcs");
  vi.stubEnv("AIRTABLE_TABLE_ID", "tblgc13tluLMgJHgo");
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("CONTACT_FROM_EMAIL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/contact", () => {
  it("writes a validated submission to Airtable and reports ok", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await post(VALID, nextIp());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toContain(
      "api.airtable.com/v0/appKznUQ11agoIbcs/tblgc13tluLMgJHgo",
    );
    const sent = JSON.parse(String(init.body));
    expect(sent.records[0].fields).toMatchObject({
      Name: VALID.name,
      Organization: VALID.organization,
      Email: VALID.email,
      Website: VALID.website,
      Timeline: VALID.timeline,
      "Budget Range": VALID.budget,
      Message: VALID.message,
      Status: "New",
    });
  });

  it("reports not-configured, and writes nothing, when Airtable is unset", async () => {
    vi.stubEnv("AIRTABLE_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await post(VALID, nextIp());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports failed, not ok, when Airtable rejects the write", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 422 })),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await post(VALID, nextIp());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ status: "failed" });
  });

  it("rejects a submission with a filled honeypot without writing anything", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await post(
      { ...VALID, [HONEYPOT_FIELD]: "http://spam.example" },
      nextIp(),
    );
    expect(response.status).toBe(400);
    // Caught by the schema itself; the honeypot is never named back to the
    // caller as a field to fix.
    expect(await response.json()).toEqual({ status: "invalid", fields: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing required fields and names them", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const response = await post(
      { ...VALID, name: "", email: "not-an-email", message: "" },
      nextIp(),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as {
      status: string;
      fields: string[];
    };
    expect(body.status).toBe("invalid");
    expect(body.fields).toContain("name");
    expect(body.fields).toContain("email");
    expect(body.fields).toContain("message");
  });

  it("names an invalid website without rejecting a blank one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );

    const bad = await post({ ...VALID, website: "not a url at all" }, nextIp());
    expect(bad.status).toBe(400);
    expect(((await bad.json()) as { fields: string[] }).fields).toContain(
      "website",
    );

    const blank = await post({ ...VALID, website: "" }, nextIp());
    expect(blank.status).toBe(200);
  });

  it("rate-limits repeated submissions from one address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    const ip = "203.0.113.7";
    for (let i = 0; i < 5; i += 1) {
      expect((await post(VALID, ip)).status).toBe(200);
    }
    const blocked = await post(VALID, ip);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ status: "rate-limited" });
  });
});
