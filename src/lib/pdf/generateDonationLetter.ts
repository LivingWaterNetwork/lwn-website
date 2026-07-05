import { renderToBuffer } from "@react-pdf/renderer";
import { DonationThankYouLetter, type DonationLetterData } from "./DonationThankYouLetter";

/**
 * Renders the branded donation thank-you letter to a PDF buffer.
 * Used by the /api/cron/send-thank-you-letters route, 7 days after a gift.
 */
export async function generateDonationLetterPdf(data: DonationLetterData): Promise<Buffer> {
  return renderToBuffer(DonationThankYouLetter(data));
}
