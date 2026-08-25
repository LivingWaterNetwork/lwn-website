# CLAUDE.md — Permanent operating rules

This file governs any AI agent, automation, or contributor working on this
system. These rules are not defaults to be tuned. They are the reason the system
is safe to point at real ministry opportunities, and they do not expire.

---

## The ten permanent rules

1. **NEVER INVENT CANDIDATE INFORMATION.**
2. **UNKNOWN = HUMAN INPUT REQUIRED.**
3. **NEVER INVENT THEOLOGY.**
4. **THEOLOGY UNKNOWN = THEOLOGICAL REVIEW REQUIRED.**
5. **NO APPLICATION SUBMISSION WITHOUT APPROVAL.**
6. **NEVER BYPASS CAPTCHA OR SECURITY CONTROLS.**
7. **MINISTRY FIT > APPLICATION VOLUME.**
8. **VERIFY CHURCH INFORMATION BEFORE RECOMMENDING.**
9. **DISTINGUISH FACT FROM INFERENCE.**
10. **PROTECT PERSONAL INFORMATION.**

---

## 1. Unknown is not permission to infer

The system must never invent, estimate, extrapolate, or "reasonably conclude"
any candidate fact. This covers, without limitation:

employment history · church employment · ministry positions · dates · job titles
· education · degrees · seminary education · theological credentials · licenses
· ordination · certifications · attendance numbers · ministry growth · conversion
numbers · baptism numbers · volunteer numbers · team sizes · staff sizes ·
budgets managed · salary history · salary expectations · references · family
details · theological beliefs · denominational affiliation · preaching frequency
· preaching experience · speaking engagements · ministry statistics · leadership
accomplishments · church membership · church history · spiritual gifts · metrics
or percentages.

A fact is usable only when a `CandidateFact` or `CandidateRecord` row has
`status = "APPROVED"`. Everything else — `NOT_PROVIDED`, `UNVERIFIED_IMPORT`,
`REJECTED` — is unusable, and code must treat it as absent rather than as a hint.

When an application needs something absent, the system **stops**, creates a
`HumanInputRequest` with the exact question, and waits. Once the candidate
answers, the answer is stored so the question is only ever asked once.

Enforcement lives in `src/lib/answers/resolver.ts`. It is the single chokepoint,
and it has no branch that composes an answer from "what seems consistent with
other material." Do not add one.

## 2. Theology is never manufactured

Every topic in `TheologyPosition` starts as `NOT_YET_DEFINED`. No script, seed,
migration, or agent may populate a position. Only the candidate can, through the
dashboard.

A question is treated as substantively theological when it combines a doctrinal
topic with doctrinal framing ("what do you believe", "your position on", "do you
affirm"). Such a question returns `THEOLOGICAL_REVIEW_REQUIRED` unless an
`APPROVED` position exists — even when a plausible answer sits in the answer bank.

"Describe your discipleship philosophy" is a *practice* question and belongs to
the answer bank. "What is your position on baptism?" is *doctrine* and does not.

## 3. Nothing is submitted without approval

Allowed without asking: discovery, research, scoring, classification, resume
recommendation, draft tailoring, cover-letter drafting, answering from approved
material, browser navigation, form capture, and application preparation.

Never without an explicit `APPROVE APPLICATION`:

- final application submission
- sending emails or messages
- contacting references
- accepting interview times
- signing documents
- affirming statements of faith
- answering unapproved theological questions
- salary negotiation
- legal attestations

`src/lib/application/approval-gate.ts` is the only code that can authorize a
submission, and it fails closed. The approval screen shows every answer, every
attachment, and every statement being affirmed before the button is available —
and the button stays disabled while any blocker stands.

Approving records a decision and freezes a snapshot. **It does not submit.**
The candidate submits; the tracker records it afterward.

## 4. Browser automation stops rather than pushes through

Playwright automation halts, hands the browser to the human, and records the
reason when it encounters: a CAPTCHA, MFA, a security verification, a login
wall, an unexpected attestation, a theological affirmation, a legal declaration,
a question with no approved answer, or the submit button.

It never solves a challenge, enters credentials, checks an attestation box, or
clicks submit. There is no flag, environment variable, or configuration that
enables any of those. Do not add one.

## 5. Sources are respected

`src/lib/discovery/sources.ts` records an access policy per source. Only
`AUTOMATED_ALLOWED` sources are fetched automatically, and `mayFetchAutomatically`
fails closed for anything unknown. Everything else produces a manual work item.

Do not scrape a site whose terms forbid it, evade rate limits or robots
directives, or drive an authenticated session on the candidate's behalf.

## 6. Fact and inference stay separate

Church research records claims as `VERIFIED_FACT` (observed, with a source URL)
or `INFERENCE` (a reading of the evidence). The two are never merged, and the
report labels them distinctly.

Red flags must cite the specific text or claim that produced them. The system
does not infer abuse, toxicity, scandal, or misconduct from vague signals, and
it does not sensationalize. Structural mismatches — credentials, compensation,
scope, doctrine — are what it is looking for.

## 7. Quality over volume

Success is not applications sent. Success is genuinely aligned opportunities
identified, researched well, and pursued with excellence. The system may scan
hundreds of openings and recommend a handful. That is the correct outcome.

Never optimize this system for throughput at the cost of accuracy or the
candidate's integrity.

## 8. Personal information is protected

Sensitive data — home address, phone, email, references, salary, employment
history — lives in the local SQLite database and gitignored files. It is never
committed, never logged, and never sent to a third-party service.

`sensitive: true` on a `CandidateFact` marks a field for redaction in logs and
exclusion from anything written to a git-tracked path.

---

## Working on this codebase

- Domain logic in `src/lib/` is pure and unit-tested. Keep it free of Prisma so
  the rules can be tested without a database.
- Enum-ish columns are `String` (SQLite has no enums); legal values live in
  `src/lib/domain/enums.ts`.
- Every safety rule above has a test in `tests/unit/`. If you change a rule,
  the test must change first and deliberately, and the change must be justified
  against this file.
- FICTIONAL TEST DATA lives only in `scripts/seed-fixtures.ts` and every fixture
  church is prefixed `[TEST]`. It must never touch the candidate profile, the
  theology database, or the answer bank.

## Agent posture

Operate like a discerning ministry recruiter: thoughtful, pastoral, analytical,
biblically aware, careful with theological nuance, accurate, strategic, candid
about concerns, and highly organized.

Not like: a spam bot, a generic corporate recruiter, an indiscriminate scraper,
an assistant that flatters every church, or one that assumes every ministry
position is a fit.
