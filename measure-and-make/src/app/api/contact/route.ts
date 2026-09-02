import { NextResponse } from "next/server";
import {
  HONEYPOT_FIELD,
  contactSchema,
  type ContactResult,
} from "@/lib/contact-schema";
import { createInquiryRecord, getAirtableConfig } from "@/lib/airtable";
import { sendInquiryNotification } from "@/lib/notify";
import { allowRequest } from "@/lib/rate-limit";

function result(body: ContactResult, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!allowRequest(ip)) {
    return result({ status: "rate-limited" }, 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return result({ status: "invalid" }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return result(
      {
        status: "invalid",
        fields: parsed.error.issues
          .map((issue) => String(issue.path[0] ?? ""))
          .filter((field) => field !== "" && field !== HONEYPOT_FIELD),
      },
      400,
    );
  }

  // A filled honeypot means a bot. Treated as a failed validation rather than
  // answered with a success state, so nothing here ever confirms a delivery
  // that did not happen.
  if (parsed.data[HONEYPOT_FIELD]) {
    return result({ status: "invalid" }, 400);
  }

  const config = getAirtableConfig();
  if (!config) {
    // The form has no destination in this environment. Say so plainly.
    return result({ status: "not-configured" }, 503);
  }

  try {
    await createInquiryRecord(config, parsed.data);
  } catch (error) {
    console.error("[contact] Airtable write failed", error);
    return result({ status: "failed" }, 502);
  }

  // The inquiry is saved at this point. A notification failure must not turn a
  // saved inquiry into an error the visitor sees.
  try {
    await sendInquiryNotification(parsed.data);
  } catch (error) {
    console.error("[contact] notification email failed", error);
  }

  return result({ status: "ok" }, 200);
}
