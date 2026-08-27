# Handoff prompt — Ministry Job Agent, session 2

Paste everything below the line into the next session. Attach your resumes to
that same message.

---

## Context

I'm Omar J. Fandino. In a previous session we built a **Ministry Job Agent** — a
local-first system that discovers church and ministry positions, researches the
churches, scores them against an approved rubric, and prepares application
materials behind hard human-approval gates.

**Repo:** `LivingWaterNetwork/lwn-website`
**Branch:** `claude/ministry-job-agent-build-28alem`
**App lives in:** `ministry-job-agent/` (standalone — its own package.json,
SQLite database, and build; deliberately isolated from the LWN website and
excluded from the site's tsconfig and Vercel deploys)

Read `ministry-job-agent/CLAUDE.md` first. It holds the permanent operating
rules and they are not negotiable. Then `README.md` and `docs/phase-2.md`.

**Review page (snapshot of all findings):**
https://claude.ai/code/artifact/22f77741-96f1-4b50-b4f3-3a5ee3d2340e

## The rules you must not break

These are enforced in code and covered by tests. Do not weaken them, do not add
a flag that bypasses them, and do not "helpfully" fill a gap.

1. **Never invent candidate information.** Not employment history, dates,
   titles, degrees, ordination, credentials, attendance numbers, budgets, team
   sizes, salary, references, or ministry metrics. If it isn't in the approved
   database, it does not exist.
2. **Unknown = HUMAN INPUT REQUIRED.** Stop and ask. Never estimate, infer, or
   extrapolate to fill a blank.
3. **Never compose theology.** Every topic is NOT_YET_DEFINED until I write it.
   Doctrinal questions return THEOLOGICAL REVIEW REQUIRED.
4. **Nothing is submitted without my explicit approval.** No emails, no
   messages, no contacting references, no signing, no affirming statements of
   faith.
5. **Never bypass CAPTCHAs, logins, MFA, or any site's terms.** LinkedIn,
   Indeed, and ChurchStaffing were deliberately not touched.

The two files that carry these: `src/lib/answers/resolver.ts` (the only code
that decides whether a question can be answered without me) and
`src/lib/application/approval-gate.ts` (the only code that can authorize a
submission — it fails closed).

## Where things stand

**Found and scored: 98 openings across 95 churches.** 48 postings fully read,
50 captured from board listings and not yet read. 4 churches researched.

Top of the list, both with reports written and packages prepared:
- **Garden Church** — Associate Pastor, Discipleship and House Churches ·
  Huntington Beach, CA · $80–85k · **77/100**
- **Ridgeway Alliance Church** — Pastor of Spiritual Formation & Missions ·
  White Plains, NY · $85–100k · **72/100**

**My profile is completely empty, and that is the bottleneck:**

| | |
|---|---|
| Approved candidate facts | **0 of 25** |
| Employment / ministry / education records | **0** |
| Theology positions defined | **0 of 25** (my choice for now — leave it) |
| Answer bank entries approved | **0 of 56** |
| Resume variants supplied | **0 of 6** |
| Applications approved or submitted | **0** |

Both prepared packages sit at `WAITING_FOR_HUMAN_INPUT` with 6 open items.
Their cover letter drafts contain `[NEEDS: approved ministry history]` markers —
that's the drafter refusing to invent my background, and a draft carrying a
marker cannot pass the approval gate.

## What I'm giving you

**My resumes** (attached to this message).

## What I want you to do

### 1. Import them properly — do not shortcut this

```bash
cd ministry-job-agent
npm install
cp .env.example .env
npm run setup          # safe to re-run; creates structure, populates nothing
```

Put the resume files in `ministry-job-agent/inbox/` and run:

```bash
npm run import
```

The importer extracts candidate claims conservatively (pattern-based, not
model-based) and files every one as `UNVERIFIED_IMPORT` with the sentence it
came from. **Importing a document does not make anything in it true about me.**

### 2. Walk me through approving the facts

Show me what was extracted, grouped, with the source sentence for each. I
approve or correct each one. Then persist the approved data as:

**Records** (`CandidateRecord`, one row per item) — the shapes are defined in
`src/lib/candidate/schema.ts`:

| kind | fields |
|---|---|
| `employment` | employer, title, start, end, location, summary |
| `ministry` | organization, role, start, end, location, summary |
| `education` | institution, credential, field, start, end, completed |
| `credential` | name, issuer, issued, expires, status |
| `ordination` | body, type, date, status |
| `leadership` | context, description, start, end |
| `teaching` | context, description, frequency, start, end |
| `metric` | claim, value, context, period |
| `skill` | name, context |
| `reference` | name, relationship, organization, email, phone, permission_to_contact |
| `link` | label, url |

**Facts** (`CandidateFact`, by exact path) — the ones the resumes should cover:

```
identity.full_name              identity.preferred_name
contact.email                   contact.phone            [both sensitive]
location.city                   location.state
credentials.highest_education   credentials.ordination_status
ministry.preaching_frequency
organization.living_water_network_role
organization.living_water_network_founding
links.website  links.linkedin  links.preaching_samples  links.portfolio
```

**Be strict about numbers.** Any metric on a resume ("led 250 students") gets
flagged `UNVERIFIED METRIC` on import. Ask me to confirm each one individually
before it becomes an approved fact. I would rather have no number than a number
I can't defend in an interview.

### 3. Build the six resume variants

Files go at these exact paths (the registry in `src/lib/resumes/variants.ts`
reads them, and a variant stays `NOT_PROVIDED` until its file exists):

| Variant | Markdown | ATS plain text |
|---|---|---|
| Young Adults | `resumes/young-adults/resume.md` | `resume-ats.txt` |
| Discipleship | `resumes/discipleship/resume.md` | `resume-ats.txt` |
| Groups / Community | `resumes/groups-community/resume.md` | `resume-ats.txt` |
| Connections / Next Steps | `resumes/connections-next-steps/resume.md` | `resume-ats.txt` |
| Associate Pastor | `resumes/associate-pastor/resume.md` | `resume-ats.txt` |
| Campus / Adult Ministries | `resumes/campus-adult-ministry/resume.md` | `resume-ats.txt` |

Also keep a master at `resumes/master/resume.md`.

**Tailoring may:** reorder bullets, change emphasis, adjust the summary, select
which accomplishments to feature, choose portfolio items, and work in
job-specific keywords naturally.

**Tailoring may never:** invent accomplishments, inflate metrics, change dates,
alter titles, create responsibilities I did not perform, or fabricate growth.

Mark each variant `APPROVED` in the database only after I've read it.

### 4. My positioning

Not an event planner or program manager. A pastoral leader focused on spiritual
formation, discipleship, young adults, leadership development, and building
healthy relational ministry cultures.

The through-line:
**formation → discipleship → community → leadership development → multiplication**

Portfolio to draw on (summaries already registered in the system — no scale,
budget, or reach claims unless I approve them as facts):
- **Living Water Network Inc.** — the organization I founded, formerly Living
  Hydatos Ministries Inc.
- **At the Table** — spiritual and emotional formation framework for Kingdom
  leaders: spiritual, mental, emotional, physical, relational health, stewardship
- **Young Adults Network (YAN)** — Connect, Collaborate, Pray, Impact
- **GATHER** — young-adult discipleship curriculum through Titus;
  "Hey Stranger → Hey Neighbor"

### 5. Then re-run the pipeline and show me the two packages

```bash
npm run score -- --all
npm run report -- --prepare
npm run dev            # dashboard at localhost:3100
```

Open `/queue` for the human-input items and `/approve/<id>` for the approval
screens. I want to see Garden Church and Ridgeway with real resume selections
and cover letters that no longer carry `[NEEDS:]` markers.

## Things that will trip you up

- **Nothing scores above ~77** and PRIORITY is unreachable, because theology
  alignment caps at 12/20 with my positions undefined. That's my decision for
  now. Don't "fix" it by writing positions for me.
- **13 openings carry a `CREDENTIAL_GAP` flag at MINOR severity** purely because
  my credentials are empty. Once you load real credentials, re-score — several
  will correctly become MAJOR (Ridgeway wants an MDiv; Bell Shoals requires one;
  Monument Bible needs ordination for its housing allowance).
- **Two flagged as `SPECIALIZED_SKILL_REQUIRED`** — one needs guitar/piano
  mastery, one needs full Spanish fluency. If I actually have either, record it
  as an approved `skill` and the flag suppresses itself.
- **Don't commit candidate data.** `data/`, `inbox/`, `candidate/`, `resumes/`,
  `jobs/`, `logs/` are gitignored on purpose. Structure is versioned; content
  is not.
- **The database is local and ephemeral in a cloud session.** If `data/` is
  empty, run `npm run setup` and re-import. The 98 openings will need
  re-importing from `inbox/` if that directory didn't persist — check first.
- **145 tests pass and typecheck is clean.** Keep it that way. If you change a
  scoring rule, change its test deliberately and say why.

## What I do NOT want

- Do not apply to anything.
- Do not write theology.
- Do not invent a single fact to make a resume read better.
- Do not touch LinkedIn, Indeed, ChurchStaffing, or Vanderbloemen.

Start by reading `CLAUDE.md`, then tell me what you found in the resumes before
you write anything.
