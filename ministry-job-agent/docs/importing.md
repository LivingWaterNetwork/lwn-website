# Importing

## What the importer does

`npm run import` reads `./inbox` and handles two kinds of file.

**Job postings** (`.json`) become opportunities. Dedup runs in two passes: a
deterministic key over normalized church + title + state, then a similarity
check for near-misses the key does not catch (different title, same job).
Matching postings merge as additional sources on one opportunity, and the
canonical URL is re-elected — the church's own careers page wins over any board.

**Source documents** (`.pdf`, `.docx`, `.md`, `.txt`, `.csv`) become
`ImportedSource` rows plus `ExtractedClaim` rows.

## Extraction is deliberately dumb

Extraction is pattern-based, not model-based. A regex that finds
"Founder, Living Water Network" and hands it over for review cannot hallucinate a
role that was never in the document. That is the whole point.

It looks for: email addresses, phone numbers, URLs, role-and-organization pairs,
education credentials, ordination references, date ranges, and numeric ministry
metrics.

Every claim carries the sentence it came from, so review is verifiable against
the source rather than a matter of trust.

## Nothing imported is approved

All claims land as `UNVERIFIED_IMPORT`. They are invisible to the scoring engine,
the answer resolver, and the cover-letter drafter until approved at `/candidate`.

Numeric metrics are labeled `UNVERIFIED METRIC` specifically because an
inflated or misremembered number is the easiest way for an application to become
untrue.

## Scanned PDFs

Text extraction needs a text layer. For a scanned document, OCR it first or paste
the text into a `.md` file.

## Re-importing

Files are deduplicated by SHA-256 of their extracted text. Re-importing an
unchanged file is a no-op; an edited file imports as new.
