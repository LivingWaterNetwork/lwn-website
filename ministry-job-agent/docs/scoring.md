# The scoring rubric

100 points across seven dimensions. Weights live in `src/lib/scoring/rubric.ts`;
each dimension is a pure function in `src/lib/scoring/dimensions.ts`.

| Dimension | Max | What it measures |
| --- | ---: | --- |
| Ministry Alignment | 30 | Lane priority × classification confidence, plus how much of the candidate's core emphases the role actually asks for |
| Theological Alignment | 20 | Compatibility, gated by whether both sides are actually known |
| Leadership Scope | 15 | Strategy ownership, team building, supervision, teaching, pastoral care, budget |
| Church Health / Culture | 10 | Credible, cited public information only |
| Compensation | 10 | Sufficiency against the approved floor and target |
| Opportunity / Trajectory | 10 | Room to build, proximity to senior leadership, authority to implement |
| Geography | 5 | A tie-breaker, not a filter |

**90+ PRIORITY · 80–89 STRONG · 70–79 REVIEW · below 70 PASS**

## Two rules that shape every dimension

**Unknown never earns full marks.** A dimension that cannot be evaluated returns
`confidence: "UNKNOWN"`, awards partial points, and names the gap in the report.
Theological alignment is the clearest case: with neither the church's doctrine
located nor any approved candidate position on file, it is capped at 8/20. That
means **nothing can reach PRIORITY until the theology database is populated.**

**Missing compensation is neutral, not zero.** An undisclosed salary scores 5/10
with UNKNOWN confidence and a note to ask directly. Penalizing silence would bury
good opportunities from churches that simply do not post numbers.

## Titles are a weak signal

`classifyLane` reads responsibilities as well as titles. A title match is worth
0.6 confidence; responsibility signals add 0.15 each. A "Next Steps Pastor"
running groups, baptism, assimilation, and leader development can outscore a
"Young Adults Pastor" who mostly books events — and ministry alignment applies an
explicit penalty when a posting leans on event logistics without formation
responsibility.

## Red flags

Detected in `src/lib/scoring/red-flags.ts`. Every flag cites the specific text or
research claim that produced it.

- `CHURCH_ON_HOLD` — CRITICAL, forces PASS
- `COMPENSATION_BELOW_FLOOR` — CRITICAL below 70% of the floor, else MAJOR
- `UNAPPROVED_DOCTRINAL_AFFIRMATION` — MAJOR
- `PASTORAL_TITLE_ADMIN_ROLE` — MAJOR
- `CREDENTIAL_GAP` — MAJOR when credentials are on file, MINOR when the database is empty
- `UNREALISTIC_WORKLOAD_FOR_PAY` — MAJOR
- `GOVERNANCE_UNCLEAR` — MINOR
- `INSUFFICIENT_POSTING_DETAIL` — MINOR

A CRITICAL flag drops classification to PASS regardless of score. MAJOR flags
demote one band each, to a floor of REVIEW — concerns to weigh, not
disqualifications.

Nothing here infers abuse, toxicity, scandal, or misconduct. The detectors look
for structural mismatches a careful recruiter would raise.

## Re-scoring

`npm run score -- --all` re-scores everything. An opportunity already in
interviews keeps its tracker status; only early-pipeline records move.
