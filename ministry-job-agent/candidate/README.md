# Candidate

Working files for the candidate profile. **Everything in this directory except
this README is gitignored** — it holds personal information.

The authoritative store is the local database, not these files. Use the
dashboard at `/candidate`, `/theology`, and `/answers` to enter and approve
information; only `APPROVED` records are ever used in an application.

- `master-profile/` — your consolidated profile working document
- `approved-facts/` — exports of approved facts, if you want a file copy
- `theology/` — drafts of theological positions before you approve them
- `references/` — reference contacts. The agent never contacts a reference.
- `approved-answers/` — drafts of application answers

To bring a document into the system, drop it in `../inbox` and run
`npm run import`. Extracted claims land as UNVERIFIED_IMPORT and are unusable
until you approve them.
