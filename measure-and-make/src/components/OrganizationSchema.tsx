import { BRAND_NAME, META_DESCRIPTION, SITE_URL } from "@/content/site";

/**
 * Organization JSON-LD carrying only claims cleared in 04-CLAIMS-REGISTER.md:
 * the name, the positioning description, and the site URL. Deliberately absent:
 * founding date, employee count, awards, ratings, reviews, logo attribution
 * implying a cleared mark, addresses, telephone numbers, and any `sameAs`
 * reference to a project — no structured data is emitted for any project,
 * approved or not.
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    description: META_DESCRIPTION,
    url: SITE_URL,
  };

  return (
    <script
      type="application/ld+json"
      // The object above is authored here, not derived from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
