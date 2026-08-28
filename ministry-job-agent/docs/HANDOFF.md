# Handoff prompt

Paste everything below the horizontal rule into a fresh Claude Code session.
Attach your resumes to that same message if you have them ready.

---

I'm Omar J. Fandino. Continue work on the **Ministry Job Agent** built in a
previous session.

**Repo:** `LivingWaterNetwork/lwn-website`
**Branch:** `claude/ministry-job-agent-build-28alem`
**App:** `ministry-job-agent/` — standalone, own package.json and SQLite
database, deliberately isolated from the LWN website

## First, get running

```bash
cd ministry-job-agent
npm install
cp .env.example .env
npm run setup            # creates the database structure; populates nothing
npm run seed:openings    # restores the 98 discovered openings + church research
npm run score -- --all   # scores are derived, not stored in the seed
npm run report -- --prepare
npm run dev              # dashboard at localhost:3100
```

The database is gitignored and cloud sessions are ephemeral, so
`npm run seed:openings` is how the discovery work survives. It's idempotent.
After any new import or research, run `npm run export:openings` and commit
`data-seed/openings.json` so the next session inherits it.

**Then read `ministry-job-agent/CLAUDE.md`.** It holds the permanent operating
rules. Then `README.md`, and `docs/phase-2.md` for what's missing.

## The rules you must not break

Enforced in code, covered by tests. Do not weaken them, do not add a flag that
bypasses them, do not helpfully fill a gap.

1. **Never invent candidate information** — employment, dates, titles, degrees,
   ordination, credentials, attendance, budgets, team sizes, salary,
   references, ministry metrics. Not in the approved database means it does not
   exist.
2. **Unknown = HUMAN INPUT REQUIRED.** Stop and ask. Never estimate or infer.
3. **Never compose theology.** Every topic is NOT_YET_DEFINED until I write it.
4. **Nothing submitted without my explicit approval** — no emails, messages,
   contacting references, signing, or affirming statements of faith.
5. **Never bypass CAPTCHAs, logins, MFA, or a site's terms.** LinkedIn, Indeed,
   ChurchStaffing and Vanderbloemen were deliberately not touched. Keep it that
   way.

Two files carry these: `src/lib/answers/resolver.ts` (the only code that decides
whether a question can be answered without me) and
`src/lib/application/approval-gate.ts` (the only code that can authorize a
submission — it fails closed).

## Where things stand

**98 openings across 95 churches.** 48 postings fully read and scored, 50
captured from board listings and not yet read. 4 churches researched. 145 tests
passing, typecheck clean.

Top two, both with reports written and packages prepared:
- **Garden Church** — Associate Pastor, Discipleship and House Churches ·
  Huntington Beach, CA · $80–85k · **77/100**
- **Ridgeway Alliance Church** — Pastor of Spiritual Formation & Missions ·
  White Plains, NY · $85–100k · **72/100**

Review page (snapshot):
https://claude.ai/code/artifact/22f77741-96f1-4b50-b4f3-3a5ee3d2340e

**My profile is empty, and that is the bottleneck:**

| | |
|---|---|
| Approved candidate facts | **0 of 25** |
| Employment / ministry / education records | **0** |
| Theology positions | **0 of 25** — my choice, leave it |
| Answer bank | **0 of 56** |
| Resume variants supplied | **0 of 6** |
| Applications approved or submitted | **0** |

Both packages sit at `WAITING_FOR_HUMAN_INPUT` with 6 open items. Their cover
letters carry `[NEEDS: approved ministry history]` markers — the drafter
refusing to invent my background. A draft with a marker cannot pass the gate.

## What I want next

**Priority one: my resumes.** I'm attaching them (or will next message).

1. Put them in `ministry-job-agent/inbox/` and run `npm run import`. The
   importer extracts claims conservatively and files every one as
   `UNVERIFIED_IMPORT` with the source sentence. Importing does not make
   anything true about me.
2. Show me what was extracted, grouped, with each source sentence. I approve or
   correct each one.
3. Persist approved data as `CandidateRecord` rows and `CandidateFact` values.
   Exact shapes are in `src/lib/candidate/schema.ts`:

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

   Fact paths the resumes should cover:
   ```
   identity.full_name              identity.preferred_name
   contact.email                   contact.phone            [sensitive]
   location.city                   location.state
   credentials.highest_education   credentials.ordination_status
   ministry.preaching_frequency
   organization.living_water_network_role
   organization.living_water_network_founding
   links.website  links.linkedin  links.preaching_samples  links.portfolio
   ```

   **Be strict about numbers.** Any metric ("led 250 students") is flagged
   `UNVERIFIED METRIC` on import. Ask me to confirm each individually. I would
   rather have no number than one I can't defend in an interview.

4. **Build the six resume variants.** These exact paths — a variant stays
   `NOT_PROVIDED` until its file exists:

   | Variant | Markdown | ATS plain text |
   |---|---|---|
   | Young Adults | `resumes/young-adults/resume.md` | `resume-ats.txt` |
   | Discipleship | `resumes/discipleship/resume.md` | `resume-ats.txt` |
   | Groups / Community | `resumes/groups-community/resume.md` | `resume-ats.txt` |
   | Connections / Next Steps | `resumes/connections-next-steps/resume.md` | `resume-ats.txt` |
   | Associate Pastor | `resumes/associate-pastor/resume.md` | `resume-ats.txt` |
   | Campus / Adult Ministries | `resumes/campus-adult-ministry/resume.md` | `resume-ats.txt` |

   Plus a master at `resumes/master/resume.md`.

   **Tailoring may:** reorder bullets, change emphasis, adjust the summary,
   select accomplishments and portfolio items, work in job-specific keywords
   naturally. **Tailoring may never:** invent accomplishments, inflate metrics,
   change dates, alter titles, create responsibilities I did not perform.

   Mark a variant `APPROVED` only after I've read it.

5. **Re-score and show me the two packages** at `/queue` and `/approve/<id>`.
   I want Garden Church and Ridgeway with real resume selections and cover
   letters with no `[NEEDS:]` markers.

**Then, if there's room:** read the 50 unread postings (they're marked
`posting not yet read`) and research the churches flagged
`researchRecommended` — several are held below the bar only by missing
research, not by being weak roles.

## My positioning

Not an event planner or program manager. A pastoral leader focused on spiritual
formation, discipleship, young adults, leadership development, and building
healthy relational ministry cultures.

**formation → discipleship → community → leadership development → multiplication**

Portfolio already registered (summaries only — no scale, budget or reach claims
unless I approve them as facts):
- **Living Water Network Inc.** — organization I founded, formerly Living
  Hydatos Ministries Inc.
- **At the Table** — spiritual and emotional formation framework for Kingdom
  leaders: spiritual, mental, emotional, physical, relational health, stewardship
- **Young Adults Network (YAN)** — Connect, Collaborate, Pray, Impact
- **GATHER** — young-adult discipleship curriculum through Titus,
  "Hey Stranger → Hey Neighbor"

## Things that will trip you up

- **Nothing scores above ~77 and PRIORITY is unreachable** because theological
  alignment caps at 12/20 with my positions undefined. That's my decision. Do
  not "fix" it by writing positions for me.
- **13 openings carry `CREDENTIAL_GAP` at MINOR severity** only because my
  credentials are empty. Once real ones load, re-score — several should
  correctly become MAJOR. Ridgeway wants an MDiv, Bell Shoals requires one,
  Monument Bible needs ordination for its housing allowance. That is the system
  working, not a regression.
- **Two flagged `SPECIALIZED_SKILL_REQUIRED`** — one needs guitar/piano mastery,
  one needs full Spanish fluency. If I have either, record it as an approved
  `skill` and the flag suppresses itself.
- **One posting is flagged `POSTING_CLOSED`** (St. Andrew Presbyterian, closed
  Sept 2024, still listed on the board). Expect more as listings age.
- **Never commit candidate data.** `data/`, `inbox/`, `candidate/`, `resumes/`,
  `jobs/`, `logs/` are gitignored on purpose. `data-seed/openings.json` is the
  one exception and holds public posting data only.
- **Keep 145 tests passing and typecheck clean.** If you change a scoring rule,
  change its test deliberately and tell me why.

## What I do NOT want

- Do not apply to anything.
- Do not write theology.
- Do not invent a single fact to make a resume read better.
- Do not touch LinkedIn, Indeed, ChurchStaffing, or Vanderbloemen.

Start by reading `CLAUDE.md`, get the pipeline restored, then tell me what you
found in the resumes before writing anything.
