export type AgreementHtmlSection = {
  /** Leading section number if the heading looks like "10. Payment...", else null (the title block, Signatures, etc). */
  sectionNumber: string | null;
  headingText: string | null;
  html: string;
};

/**
 * Splits the agreement's rendered HTML into one chunk per top-level (`<h2>`)
 * section, so the signer UI can inject an inline initials control right
 * after a specific section (matched by its leading number) without needing
 * to parse/re-render the document as a DOM tree.
 */
export function splitHtmlIntoSections(html: string): AgreementHtmlSection[] {
  const chunks = html.split(/(?=<h2[ >])/i).filter((c) => c.trim().length > 0);

  return chunks.map((chunk) => {
    const headingMatch = chunk.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const headingText = headingMatch ? headingMatch[1].replace(/<[^>]+>/g, "").trim() : null;
    const numberMatch = headingText?.match(/^(\d+)\./);
    return {
      sectionNumber: numberMatch ? numberMatch[1] : null,
      headingText,
      html: chunk,
    };
  });
}
