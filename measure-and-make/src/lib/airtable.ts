import "server-only";

import type { ContactSubmission } from "./contact-schema";

/**
 * Contact submissions are stored in Airtable, not in a database owned by this
 * site — there is deliberately no Prisma model and no schema of our own for the
 * contact form. Living Water Network's own database is not touched.
 *
 * Every value below comes from the environment. If any of them is missing the
 * form reports honestly that it cannot deliver yet, rather than showing a
 * success state that would be a lie to a real visitor.
 */
export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableId: string;
}

export function getAirtableConfig(): AirtableConfig | null {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  if (!apiKey || !baseId || !tableId) return null;
  return { apiKey, baseId, tableId };
}

/** Field names must match the Inquiries table in the Measure & Make base. */
export async function createInquiryRecord(
  config: AirtableConfig,
  submission: ContactSubmission,
): Promise<void> {
  const response = await fetch(
    `https://api.airtable.com/v0/${config.baseId}/${config.tableId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        typecast: true,
        records: [
          {
            fields: {
              Name: submission.name,
              Organization: submission.organization,
              Email: submission.email,
              Phone: submission.phone || undefined,
              Website: submission.website || undefined,
              "Organization Type": submission.organizationType || undefined,
              Interests: submission.interests.length
                ? submission.interests
                : undefined,
              Timeline: submission.timeline || undefined,
              "Budget Range": submission.budget || undefined,
              Message: submission.message || undefined,
              "Submitted At": new Date().toISOString(),
              Status: "New",
              Source: "measure-and-make website contact form",
            },
          },
        ],
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Airtable rejected the inquiry (${response.status}): ${detail.slice(0, 300)}`,
    );
  }
}
