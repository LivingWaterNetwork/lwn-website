# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. See
`README.md` for general setup/run instructions.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma 5 + Postgres (`DATABASE_URL`), schema-first — this repo uses
  `prisma db push`, not migration files. After editing `prisma/schema.prisma`,
  run `npx prisma generate` locally and `npm run db:push` against the real
  database (done manually by Omar in production; see `CLAUDE_HANDOFF.txt` for
  history on this).
- Tailwind CSS, Zod validation, Resend/Microsoft Graph for email
  (`src/lib/email.ts`), `@react-pdf/renderer` for PDFs.
- Tests: `npm run test` (Vitest, unit only, no live DB) and
  `npm run test:e2e` (Playwright).

## Adding an agreement (LWN Agreements)

`/agreements` is a private, reusable e-signature portal. It's built as a
template system — adding a new kind of agreement (not just a new instance of
an existing one) should not require touching the signer UI, API routes, or
PDF generator.

### Adding a new template version

1. Create `content/agreements/<key>/<version>.md` (version must be semver,
   e.g. `1.0.0`). The filename must equal `<version>.md` and the frontmatter
   `key` must equal the directory name — both are enforced at load time
   (`src/lib/agreements/templates.ts`).
2. Frontmatter fields: `key`, `version`, `title`, `signerRoles` (ordered list
   of `{ role: partner|participant|organization, label, order, requiredBeforeSend? }`),
   `requiredInitials` (list of `{ section: "10", label: "..." }` — `section`
   is the leading number of a `## 10. ...` heading in the body), `status`
   (`draft` while iterating, `published` once ready to use), and
   `variablesSchema` (optional `fields: { <name>: { type: "currency"|"date" } }`
   plus an optional `installmentsField` naming an array field to render as a
   markdown table — see below).
3. Body is markdown. Use `{{variable_name}}` for any value that should come
   from the agreement's variables (money, dates, names, counts). The renderer
   fills these in once at freeze time ("ready") — see Immutability below.
4. Two system token families are the *only* unresolved tokens allowed to
   remain after substitution:
   - `{{system:effective_date}}` — filled in when the last required signer
     signs.
   - `{{system:signature:<role>}}` — filled in from that signer's actual
     signature once they sign. `<role>` must match a `role` in `signerRoles`.
     Document order and signing-workflow order (`signerRoles[].order`) are
     independent — a role can sign first but have its signature block appear
     last in the text (this is how the Delivery Partner Acceptance section
     works: MMG accepts before the participant is even sent the link, but its
     signature block is the last thing in the document).
5. For a variable declared in `variablesSchema.fields` with `type: "currency"`
   or `type: "date"`, the renderer automatically computes `${name}_display`
   (and `${name}_weekday_display` for dates) — use those in prose instead of
   formatting money/dates by hand. For an `installmentsField` (an array of
   `{ label, due, amount }`), the renderer computes `${field}_table` as a
   ready-to-insert markdown table — reference it as `{{installments_table}}`
   (or whatever you named the field) rather than hand-writing the table, so
   a future agreement with 3 installments instead of 2 needs zero template
   changes.
6. Run `npm run agreement:seed-templates` to load every template file into
   the `agreement_templates` table.

### Creating an agreement instance

Either:

- **CLI**: `npm run agreement:new -- --template <key> --name "Full Name" --email you@example.com --vars path/to/vars.json [--version X.Y.Z] [--test]`.
  The vars file shape is `{ variables: {...}, signers: [...], paymentUrl?, expiresInDays? }`
  — see `content/agreements/lwn-coaching-business-launch/instances/amaya-frias-revival-skn.vars.json`
  for a real example.
- **Admin dashboard**: `/agreements/admin` → "Create agreement", which calls
  the same shared service function (`createAgreementFromTemplate` in
  `src/lib/agreements/service.ts`) as the CLI.

Either path creates a `draft` agreement. An admin must then: preview it,
mark it **ready** (freezes the content — see below), record any
`requiredBeforeSend` signer's acceptance (e.g. MMG's partner acceptance),
then **send** (generates the access code, shown once).

### Immutability — the one-way door

Two separate things are immutable, for two different reasons:

1. **A published template version never changes.** `npm run agreement:seed-templates`
   throws `TemplateImmutabilityError` if a published template's file content
   hash no longer matches what's stored in the DB. Ship a new version file
   instead of editing one that's already published.
2. **An agreement's `renderedBody`/`contentSha256` are frozen the moment it
   becomes "ready"** (`markAgreementReady` in `src/lib/agreements/service.ts`).
   Every view, signature, and PDF downstream uses that exact frozen snapshot
   — not the live template or the agreement's `variables`. If an agreement's
   terms need to change after this point (including after anyone has
   signed), void it and create a new one; there is no "edit in place" path,
   by design.

### Isolation

Every signer-facing API route (`src/app/api/agreements/[slug]/*`) resolves
the agreement strictly from the route's own `:slug` and then checks that the
session cookie was minted for that exact agreement id
(`requireAgreementSession` in `src/lib/agreements/requestHelpers.ts`). Never
add a route that takes an agreement id from the request body or query string
and trusts it — see `tests/unit/agreementSession.test.ts` for the isolation
guarantee this depends on.

### Test guards

- `npm run test` runs `tests/unit/agreementTemplates.test.ts` (duplicate
  key/version, directory/filename-vs-frontmatter mismatches, published-version
  hash-mismatch immutability) and `tests/unit/agreementSession.test.ts`
  (per-agreement session isolation), alongside render/crypto/lockout unit
  tests.
- `is_test: true` agreements (CLI `--test`, admin "Test record" checkbox, or
  any slug starting with `test-`) never send email and are excluded from the
  admin dashboard by default (`?includeTest=1` to see them). Do all QA on
  `test-*` records and delete them from the DB afterward.

## Member Portal (LWN Portal)

`/portal` is a private, template-driven space (coaching/mentoring/counseling
members, later cohorts) layered on top of the same database. It is a
**separate product area from Agreements** — its own `portal_*` tables, its
own login-code auth (`portal_sessions`, not `agreement_signers`), its own
session secret (`PORTAL_SESSION_SECRET`) — deliberately not an extension of
the Agreements signer system, because a portal member, coach, admin, or
partner is not necessarily an agreement signer at all. The only two places
the two systems touch are a scalar (non-Prisma-relation) FK from
`portal_enrollments.agreementId` into `agreements.id`, and a similar one from
`portal_documents.agreementDocumentId` into `agreement_documents.id` — both
read-only references; `AgreementTemplate`/`Agreement`/`AgreementDocument`
and their behavior are never modified for the portal's sake.

### The one rule that is not `prisma db push` for this feature

Every other table in this repo reached production via Omar manually running
`npx prisma db push` from `schema.prisma`. The portal's `portal_*` tables are
the one deliberate exception: `scripts/portal-migrate.ts` is a hand-written,
allowlist-checked, additive-only DDL runner (`CREATE TABLE` / `CREATE INDEX`
/ `CREATE TYPE` / `ALTER TABLE ... ADD CONSTRAINT` on a `portal_*` table the
same file creates — nothing else, ever). It's dry-run by default; `--apply`
is required, and applying it against the shared Preview+Production database
is a production change that needs sign-off first. Prisma models for the
portal still live in `schema.prisma` as normal and `npx prisma generate`
still runs for client types — only the schema-sync-against-the-real-database
step is replaced. See `tests/unit/portalMigration.test.ts` for the refusal
cases this is tested against.

### The policy module — no `portal_*` query outside `lib/portal/data`

`lib/portal/auth.ts` turns the `lwn_portal` session cookie into a
`PortalActor` (member / coach / admin / partner-org user — a person can hold
more than one of these). `lib/portal/policy.ts` resolves what enrollments
that actor may touch (`getEnrollmentScope`) and, for a partner, which
narrow `PARTNER_GRANTABLE_MODULES` they're allowed (Phase 1: `brand_website`
only — a completely separate list from `MODULES_AVAILABLE`, the member/coach
enrollment modules; don't conflate the two, that bug shipped once already).
`lib/portal/data/*` is the **only** code allowed to query a `portal_*`
Prisma model — every function there takes the actor, builds the scope into
its own `where`, and returns `null` for anything out of scope (never a
thrown 403), so a route turns that into a flat 404 and an id can never be
distinguished from "not yours." `tests/unit/portalNoDirectQueries.test.ts`
fails the build the moment any file under `src/app` queries a `portal_*`
model directly instead of going through `lib/portal/data`.

`portal_meeting_private_notes` is its own table, never joined by any
member- or partner-facing query, so a private coach note can never leak
through a shared code path by accident.

### Adding a program template version

Same shape as Agreements: a file at
`content/programs/<key>/<version>.json` whose `key`/`version` must match its
directory/filename (enforced at load time,
`src/lib/portal/programTemplates.ts`), and a published version is immutable
— ship a new version file rather than editing one already published
(`ProgramTemplateImmutabilityError`). `npm run portal:seed-templates` loads
every file into `portal_program_templates`.

A template's `modules` array may list a module the app doesn't render yet
(e.g. a Phase 3 `cohort` draft) — `unknownModules()` surfaces that instead
of silently dropping it. Only modules in `MODULES_AVAILABLE`
(`lib/portal/constants.ts`) actually gate anything today; `core` (journey,
sessions, steps, documents) is always on and isn't in that list.

### Enrolling a member

`npm run portal:enroll -- --template <key> --email <email> --name "Full
Name" --coach-email <coach> --start <date> [--end <date>] [--version X.Y.Z]
[--payment-url <url>] [--test]` always creates a **draft** enrollment —
never invites, never emails. It copies the template into
`templateSnapshot`, creates phases/placeholder sessions/default steps from
it, and auto-links an `Agreement` by matching the participant's email —
only when exactly one match exists; zero or multiple matches leave it
unlinked with a warning, since an agreement is void-and-recreate rather than
edit-in-place and a naive 1:1 link could otherwise silently point at a
voided one.

### Test guards

- `tests/unit/portalMigration.test.ts` — the migration allowlist refusals.
- `tests/unit/portalNoDirectQueries.test.ts` — no `src/app` file queries a
  `portal_*` model directly.
- `tests/unit/portalPolicy.test.ts` — scope isolation for member/coach/
  admin/partner, including the partner-module allowlist.
- `tests/unit/portalAccess.test.ts`, `portalCrypto.test.ts` — the login
  throttle/lockout state machine and the keyed-HMAC hashing that makes
  rotating `PORTAL_SESSION_SECRET` actually invalidate every session at
  once (not just future tokens).
- `tests/unit/portalProgramTemplates.test.ts` — template load errors and
  immutability.
- `is_test: true` portal persons/enrollments never send email (gated in
  `lib/portal/notify.ts`, same convention as Agreements) and are cleaned up
  with `npm run portal:cleanup-test`, which fails loudly if anything
  test-flagged survives. In Preview, real emails only ever go to
  `ofandino@lwnetwork.org` regardless of `is_test` — every other recipient
  is silently skipped and logged while QA is underway.

### Known limitations (Phase 1)

- **Step reordering has no drag UI yet.** `PATCH /api/portal/admin/steps/[id]`
  accepts an `order` field and `createStepForStaff`/`updateStepForStaff`
  support it, but the admin Steps tab only creates steps — there's no
  drag-and-drop or manual reorder control in the UI yet.
- **Admin "linked agreement" is a raw ID paste**, not a picker. The
  enrollment overview's "Linked agreement ID" field doesn't validate that
  the ID exists, isn't voided, or belongs to the right participant — admin
  "pick from Agreements by participant email" (as the original spec
  describes) isn't built; staff must copy the ID from `/agreements/admin`
  themselves. `createDraftEnrollmentFromTemplate`'s own auto-link (used by
  both the CLI and "Create member") *does* match by participant email and
  refuses to guess when zero or multiple agreements match.
- **No calendar sync.** Session times are set by hand in the admin; nothing
  pushes to or pulls from Zoom/Google Calendar/Outlook.
- **Payment status is manual.** There's no Bluevine (or any payment
  processor) webhook — marking an installment paid/adjusted/waived is
  always a deliberate admin action from the Payments tab.
- **No in-app messaging.** `messages` is a Phase 3 module name only; there
  is no thread/message UI anywhere yet.
- **Document magic-byte detection can't fully distinguish DOCX from any
  other zip file** (both start `PK\x03\x04`) — acceptable for Phase 1 since
  uploads are staff-only, never member-supplied, and still bounded by the
  10 MB cap and the four-type allowlist.
- **No automated browser/E2E test of the login flow or isolation
  guarantees** — `tests/unit/` covers the pure logic and the Prisma-mocked
  policy/scoping functions, but there's no Playwright run exercising the
  real `/portal/login` → code → session cookie path end to end, or a live
  two-browser-context isolation check. That has to happen as a manual
  preview walkthrough with `test-*` records (see the release checklist),
  since it needs the real shared Preview+Production database and real
  email delivery.
