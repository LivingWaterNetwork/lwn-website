# Inbox

Drop files here, then run `npm run import`.

## Job postings

A `.json` file containing one posting or an array of them:

```json
{
  "source": "churchstaffing",
  "sourceUrl": "https://www.churchstaffing.com/job/123456/",
  "canonicalUrl": "https://thechurch.org/careers/young-adults-pastor",
  "title": "Young Adults Pastor",
  "churchName": "Example Community Church",
  "city": "Franklin",
  "state": "TN",
  "employmentType": "FULL_TIME",
  "descriptionText": "Paste the full posting text here.",
  "responsibilities": ["…"],
  "qualifications": ["…"],
  "salaryMin": 65000,
  "salaryMax": 80000,
  "benefits": ["health insurance", "retirement"]
}
```

Only `title` and `churchName` are required; everything else improves the score's
confidence. Missing fields are recorded as unknown, never guessed.

The same job posted on four boards becomes **one** opportunity with four
sources. Include `canonicalUrl` when you have the church's own page — it wins.

## Source documents

`.pdf`, `.docx`, `.md`, `.txt`, `.csv` — resumes, bylaws, curricula, ministry
documents, transcripts.

Import extracts *candidate claims* and files them as `UNVERIFIED_IMPORT` with
the sentence each came from. **Importing a document does not make anything in it
true about you.** Review and approve claims at `/candidate` before they can be
used in an application.

---

Files in this directory are gitignored.
