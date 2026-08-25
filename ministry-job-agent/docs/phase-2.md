# Phase 2 — Populating the profile

Phase 1 built the system. Phase 2 fills it in. Until it is done, the agent will
refuse to answer most application questions — which is the intended behavior, not
a bug to work around.

Work through these in order. Each group is the minimum needed to search
responsibly, not an exhaustive questionnaire.

## 1. Employment history
Where you have worked, in what role, and when. Enter each as a candidate record.
Nothing is read off a resume and adopted automatically.

## 2. Ministry history
Ministry roles, organizations, and dates — including your role with Living Water
Network Inc. (formerly Living Hydatos Ministries Inc.).

Do **not** enter organizational scale, staffing, budget, reach, or tax status
unless you are stating it as fact. The system will never infer any of it.

## 3. Education
Institutions, credentials, fields, and whether each was completed.

## 4. Credentials and ordination
Ordination status, licensing body, certifications. Many postings require these,
and the red-flag detector cannot assess a credential gap without them.

## 5. Core theology
Go to `/theology`. Every topic starts NOT YET DEFINED and the system will not
write one for you.

### Working from reference statements

You named Change Church, 2819 Church, Victory Church, and Christ for all Nations
as aligning with your theology. Their published statements are loaded as
**reference material** — quoted verbatim, attributed, linked to the source — and
mapped article-by-article to your topics. Each topic shows the relevant articles
so you can react to real wording instead of starting from a blank page.

They are not your positions. Nothing in `references.ts` is ever read when
answering an application question; the resolver only reads APPROVED positions
you wrote. A test enforces this (`tests/unit/theology-references.test.ts`).

Two reasons this matters beyond principle:

**Your sources disagree with each other.** The dashboard shows where:

- *Charismatic theology / spiritual gifts* — CfaN states tongues as the evidence
  of Spirit baptism (classical Pentecostal initial-evidence doctrine). Victory
  affirms Spirit baptism without stating initial evidence. Change and 2819 do
  not address it. Adopting all four gives you contradictory answers.
- *Eschatology* — CfaN affirms the rapture of the Church (dispensational
  language). 2819 and Change affirm a visible second coming without specifying a
  rapture. Reformed and amillennial churches notice which language you use.

**Seven topics have no coverage at all**, two of which get asked constantly:
**women in ministry** and **church governance**. No statement you named addresses
either. You will write those from scratch, and they materially determine fit.

When you approve a position, record whether you wrote it yourself or adapted it
from a source. In an interview you should know which is which — a committee will
ask you to expand on anything you affirm.

Prioritize the topics applications actually ask about: Scripture, salvation,
the gospel, baptism, the Holy Spirit, spiritual gifts, women in ministry,
human sexuality, and church governance. These also unlock theological alignment
scoring, which is capped at 40% while the database is empty — meaning **nothing
can reach PRIORITY until you define positions.**

## 6. Salary requirements
Your floor, your target, and how you want the "salary expectations" question
answered. These drive compensation scoring and the underpaid-posting red flag.
The agent will never negotiate on your behalf.

## 7. References
Names, relationships, and whether you have permission to list them. The agent
never contacts a reference.

## 8. Preaching and teaching
Links, samples, and how often you have taught and in what settings.

## 9. Measurable ministry experience
Any numbers you want used — group counts, team sizes, anything. Only what you
state. The system never estimates a number, and imported numbers are flagged
`UNVERIFIED METRIC` until you approve them.

## 10. Relocation preferences
Regions you want, regions you would rather not, and any constraints. The default
is nationwide with relocation open.

---

## Also worth doing early

**Answer bank** (`/answers`) — 56 seeded questions with empty answers. These are
the questions churches actually ask. Writing them once means the agent can fill
them consistently forever. Mark an answer "allow automatic use" only when you are
comfortable with it going onto a form without you re-reading it.

**Resume files** — each variant under `./resumes` points at a file you supply.
Until the file exists, the variant is NOT_PROVIDED and any package selecting it
is blocked from approval. Provide a Markdown version and an ATS-friendly plain
text version.

**Portfolio** — `./portfolio` has a directory per asset. Add summaries, links,
and selected excerpts. Do not add full curricula: applications get a summary and
a link, never a document dump.

## When you are done

Run `npm run discover` to see what each source needs from you, import real
postings, and score them. Then review the strongest, and approve nothing you
have not read in full.
