# Architecture notes

## Why local-first

Everything runs on one machine: Next.js, SQLite, Playwright. Candidate personal
information — address, phone, references, salary, employment history — never
leaves it. There is no API to secure, no database to lock down, no vendor to
trust, and no telemetry.

The whole database is one gitignored file. Backing it up is `cp`.

## Why SQLite has no enums here

SQLite has no native enum type, so every enum-ish column is `String`. The legal
values live in `src/lib/domain/enums.ts` as `as const` arrays with derived
TypeScript unions, which gives compile-time safety without a migration every time
a status is added.

## Why domain logic is Prisma-free

`scoreOpportunity`, `resolveQuestion`, `authorizeSubmission`, `detectRedFlags`,
and the dedup functions are pure. They take plain objects and return plain
objects.

That is what makes the safety rules testable. `tests/unit/answers.test.ts` proves
that a DRAFT answer is never used, without standing up a database. When a rule in
CLAUDE.md changes, there is exactly one function to change and one test file that
must change with it.

The Prisma-aware wrappers (`scoring/service.ts`, `application/package-builder.ts`)
do loading and persistence only.

## Two chokepoints

The system's safety properties come from having exactly two places where the
important decisions happen:

**`src/lib/answers/resolver.ts`** decides whether a question can be answered
without a human. Every form fill, every cover letter, every package build goes
through it. Its default branch is `HUMAN_INPUT_REQUIRED` — the accuracy rule is
enforced by the shape of the function, not by remembering to check.

**`src/lib/application/approval-gate.ts`** is the only code that can authorize a
submission, and it accumulates blockers rather than returning early, so the
candidate sees everything wrong at once instead of one thing at a time.

## Derived status, not set status

An `ApplicationPackage` status is recomputed from what is actually outstanding —
`WAITING_FOR_HUMAN_INPUT` exactly when an open `HumanInputRequest` exists for it.
No code path sets `READY_FOR_APPROVAL` directly. This is why answering a queue
item automatically advances the package, and why nothing can be talked into
looking ready.

## Dedup in two passes

A deterministic SHA-256 key over normalized church + title + state is a unique
index, so the common case ("same job, four boards") is a single upsert. A
similarity pass — word 3-gram Jaccard over descriptions, plus canonical URL
comparison — catches the rest.

City is deliberately excluded from the key: boards disagree about suburb versus
metro, and "Franklin" versus "Nashville" should not create two records.

## Scoring extension points

To add a dimension: write a pure function in `dimensions.ts`, register its weight
in `rubric.ts`, add it to the array in `engine.ts`. The report and the dashboard
render from the persisted breakdown, so both pick it up with no further changes.

To add a red flag: add a detector in `red-flags.ts` returning a `RedFlag` with
`evidence` populated. Flags without evidence are a bug — the report prints the
evidence line verbatim.
