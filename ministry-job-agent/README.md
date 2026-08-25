# Ministry Job Agent

A personal ministry-search platform for **Omar J. Fandino**: it discovers church
and Christian ministry positions nationwide, researches the churches behind them,
scores them against an approved rubric, prepares tailored application materials,
and stops — every time — at the point where a human decision is required.

It is not a job scraper and it is not built for volume. It is built to find a
small number of genuinely aligned opportunities and pursue them with excellence.

**Nothing is submitted without explicit approval. The agent never invents a fact
about the candidate, never composes theology, and never bypasses a security
control.** Those rules are enforced in code and tested; see [CLAUDE.md](./CLAUDE.md).

---

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js 14 (App Router) + TypeScript strict | Server components render straight from the database — no API layer to maintain for a single-operator tool. |
| Styling | Tailwind CSS | The UI is dense and tabular; utility classes keep it consistent without a component library to version. |
| Database | SQLite via Prisma | Local-first. The whole database is one gitignored file. Candidate data never leaves the machine. |
| Automation | Playwright | Headed by default so the candidate can watch and take over at any point. |
| Tests | Vitest | Domain logic is pure and Prisma-free, so the safety rules test without a database. |
| Scripts | tsx | Same TypeScript, no build step. |

Deliberately **not** used: microservices, queues, containers, cloud
infrastructure, or a vector database. The whole system runs on one machine.

### Where the logic lives

```
src/lib/
  domain/       enums, ministry lanes, shared types
  scoring/      rubric, per-dimension scorers, red flags, engine, DB service
  answers/      question normalization + the answer resolver (the safety chokepoint)
  theology/     topic registry and doctrinal-question detection
  application/  approval gate, package builder, cover letter, report renderer
  dedup/        one job across four boards = one opportunity
  discovery/    source access policies, search terms, connectors
  resumes/      variant registry and selection
  portfolio/    ministry portfolio registry and per-role selection
  imports/      conservative claim extraction from source documents
browser/        safety stops, form capture, assisted fill
```

Two files carry most of the weight:

- **`src/lib/answers/resolver.ts`** — the only code that decides whether a
  question can be answered without a human.
- **`src/lib/application/approval-gate.ts`** — the only code that can authorize
  a submission. It fails closed.

---

## Setup

```bash
cd ministry-job-agent
npm install
cp .env.example .env          # DATABASE_URL points at ./data/ministry-agent.db
npm run setup                 # generate client, create the database, seed structure
```

`npm run setup` creates the *shape* of everything — candidate fact slots,
theology topics, answer-bank questions, resume slots, portfolio entries, the
hold list, search preferences — and populates **none** of it. Every candidate
fact starts `NOT_PROVIDED` and every theological position starts
`NOT_YET_DEFINED`. That is deliberate and permanent.

Then start the dashboard:

```bash
npm run dev                   # http://localhost:3100
```

### Optional: test data

```bash
npm run seed:fixtures         # FICTIONAL TEST DATA, churches prefixed [TEST]
npm run score
npm run report -- --prepare
```

Fixtures exercise the scoring bands, red-flag overrides, dedup, and the approval
gate. They never touch the candidate profile, theology, or answer bank.
`npm run db:reset` clears everything.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dashboard on :3100 |
| `npm run setup` | Create the database and seed structure (safe to re-run) |
| `npm run discover` | Run a discovery pass; prints manual work items for restricted sources |
| `npm run import` | Import postings and source documents from `./inbox` |
| `npm run score` | Score unscored opportunities (`-- --all` to re-score) |
| `npm run report` | Write standardized reports for everything 70+ into `./jobs` |
| `npm run report -- --prepare` | Also build application packages |
| `npm run apply:assist -- --package=<id>` | Open the application and capture its questions |
| `npm run apply:assist -- --package=<id> --fill` | Fill approved answers, then stop |
| `npm run test` | Unit tests |
| `npm run db:studio` | Browse the database |
| `npm run db:reset` | Wipe and recreate |

---

## How work flows

```
discover → import → score → report → prepare package
                                          ↓
                              human input queue (blocking)
                                          ↓
                              approval screen (blocking)
                                          ↓
                        you submit → record submission → follow-up
```

**Discovery.** Sources declare an access policy. Only `AUTOMATED_ALLOWED` sources
are fetched; everything else produces a manual work item with ready-to-paste
queries. Job boards that prohibit automated access are respected, not routed
around. See Settings in the dashboard for the current policy per source.

**Import.** Drop files into `./inbox`. Postings (`.json`) become opportunities,
deduplicated against what is already known. Source documents (`.pdf`, `.docx`,
`.md`, `.txt`, `.csv`) become `UNVERIFIED_IMPORT` claims that you review — an
import never makes anything true about you.

**Scoring.** 100 points: ministry alignment (30), theological alignment (20),
leadership scope (15), church health (10), compensation (10), trajectory (10),
geography (5). 90+ PRIORITY · 80–89 STRONG · 70–79 REVIEW · below 70 PASS.

Two things about the rubric are worth knowing:

- *Unknown never earns full marks.* With an empty theology database, theological
  alignment is capped at 40% of its points. Nothing can reach PRIORITY until you
  define your positions — by design.
- *Red flags can override the score.* A church on your hold list, or pay well
  under your floor, drops straight to PASS regardless of how well it reads.

**Application packages.** Resume variant, cover letter angle, and portfolio
selection are derived from the ministry lane and the church research. The cover
letter draft is built from approved material and cited research only; anywhere it
would need a fact the system does not have, it writes `[NEEDS: ...]` instead of
inventing one — and a draft containing a marker cannot be approved.

**Human input queue.** Everything the system refused to guess lands here with the
exact question. Answering one stores it in the answer bank or theology database,
so you answer each question once.

**Approval.** The screen shows the church, role, score, compensation, theology,
concerns, resume, cover letter, every attachment, every answer, and every
statement you would be affirming. The APPROVE button is disabled while any
blocker stands. Approving records your decision and freezes a snapshot — **it
does not submit anything.**

---

## Browser automation

Playwright, headed by default so you can watch and take the keyboard.

It may: open the job page, navigate the application, fill fields that have an
approved answer marked for automatic use, upload approved documents, capture the
form's questions, and report what it could not answer.

It stops — every time, no exceptions, no override flag — at:

- a CAPTCHA or bot challenge
- multi-factor authentication or a security verification
- a login wall
- an unexpected attestation
- a theological affirmation or statement of faith
- a question with no approved answer
- a legal declaration
- **the submit button**

`--fill` refuses to fill a partial application: if any question is unresolved, it
stops and sends you to the queue instead. There is no flag that submits.

---

## Data safety

- The database lives in `./data` and is gitignored, as are `./inbox`,
  `./logs`, `./applications`, `./research`, and generated reports in `./jobs`.
- Candidate directories (`./candidate`, `./resumes`) are gitignored except their
  README files, so structure is versioned and content is not.
- Fields marked `sensitive` are redacted from logs and excluded from anything
  written to a git-tracked path.
- No candidate data is sent to any third-party service. There is no telemetry.
- **Keep this repository private.**

---

## Current status: Phase 1 complete

Built and tested: the schema, the scoring engine, red flags, dedup, the answer
resolver, the theology gate, the approval gate, the package builder, the report
renderer, the browser safety layer, source import, and the full dashboard.

Not yet possible: real applications. The candidate profile is empty by design.
See [docs/phase-2.md](./docs/phase-2.md) for what to supply and in what order.
