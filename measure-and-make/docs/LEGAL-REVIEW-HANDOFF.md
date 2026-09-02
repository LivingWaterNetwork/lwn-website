# Internal handoff: legal review required before production launch

Not part of the public site. This file is the checklist for the owner and
counsel; nothing in it is rendered to a visitor.

## Status

`/measure-and-make/privacy` and `/measure-and-make/terms` are **complete
prelaunch drafts**, not attorney-reviewed copy. Both are editorially and
visually finished, carry an effective date of **September 2, 2026**, and are set
to `noindex` (`robots: { index: false, follow: true }` in each page's metadata).
They are also excluded from `sitemap.xml`.

**Do not remove the `noindex` and do not add these pages to the sitemap until
the owner and an attorney have approved the copy.**

## What the drafts assert, and why

Both documents were written from an audit of this repository, not from a
template. Everything factual in them is true of the code as it stands:

- No cookies are set. No analytics, tag manager, advertising, or tracking pixel
  exists in the app. There is no consent banner because there is nothing to
  consent to.
- Fonts are self-hosted by `next/font` at build time, so a page view makes no
  request to a font provider.
- The only data collected is what a visitor submits on `/start`.
- The only third-party processor for that data is **Airtable** (base
  `appKznUQ11agoIbcs`, table `Inquiries`), written server-side, plus the hosting
  provider's ordinary request logging.
- The submitter's IP address is read for rate limiting, held in process memory
  only, and never written to the inquiry record.

If any of that changes — an analytics provider, an email sender, a CRM, a chat
widget, a font CDN — **the Privacy Policy must be updated in the same change.**

## For counsel

1. Review the Privacy Policy and Terms of Service in full.
2. Confirm the Georgia governing-law and venue language in Terms §15 is right
   for the entity that will actually operate the site.
3. Confirm the limitation-of-liability and warranty-disclaimer language
   (Terms §§12–13) is enforceable and appropriately scoped.
4. Confirm the twenty-four-month inquiry retention period in Privacy §7 matches
   what the business actually intends to do.
5. Confirm the interim Living Water Network relationship disclosure is
   sufficient for a for-profit venture operating on a 501(c)(3)'s domain and
   infrastructure, and whether anything further is needed once invoicing starts.
6. Advise whether a named legal entity, registered address, or registered agent
   must appear on these pages before launch. None is asserted now: no entity
   name, address, attorney, or registration number has been invented.

## Open items that are not legal

- The Airtable notification automation (`wflq3djrWd5vj2mmL`) is saved as a draft
  and currently addresses `info@lwnetwork.org`. Measure & Make should not route
  commercial inquiries to Living Water Network's nonprofit inbox: change the
  recipient to a Measure & Make address before enabling it.
- `AIRTABLE_API_KEY` is not set in any environment yet. Until it is, the form
  reports honestly that nothing was saved.
