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
     signature block is the last thing in the document). Signers can also
     complete in any order relative to each other: LWN can countersign (and
     MMG can accept) before the participant ever opens the link — "presigning"
     — so her signature is the one that completes execution, or LWN can
     countersign last, in the original order. Whichever route's signature
     happens to be the last one calls `finalizeExecution`
     (`src/lib/agreements/finalize.ts`) to generate the executed PDF and send
     the "fully executed" notifications exactly once.
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
