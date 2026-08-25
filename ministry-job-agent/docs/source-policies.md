# Source access policies

The agent reads `src/lib/discovery/sources.ts` before it touches any site.
`mayFetchAutomatically()` fails closed: a source is fetched automatically only if
it is explicitly `AUTOMATED_ALLOWED` and enabled.

| Policy | Meaning |
| --- | --- |
| `AUTOMATED_ALLOWED` | Public content, no login, automated fetching appears permissible for this host |
| `MANUAL_ONLY` | Account-gated, or terms restrict automated access. The candidate drives the browser |
| `API_REQUIRED` | Official API or feed; use credentials the candidate supplies |
| `UNREVIEWED` | Not yet assessed. Treated as manual-only |

## Current assignments

| Source | Policy | Reasoning |
| --- | --- | --- |
| Church career pages | AUTOMATED_ALLOWED | Public pages. Fetch politely, honor per-host robots.txt |
| Manual / inbox | AUTOMATED_ALLOWED | The candidate's own files. Always permitted |
| ChurchStaffing | MANUAL_ONLY | Account required; terms restrict automated collection |
| Vanderbloemen | MANUAL_ONLY | Search firm — roles run through a consultant relationship |
| Slingshot Group | MANUAL_ONLY | Same |
| Indeed | MANUAL_ONLY | Terms prohibit scraping and the site actively blocks it |
| LinkedIn | MANUAL_ONLY | Authentication required; automated access prohibited |
| ZipRecruiter | MANUAL_ONLY (disabled) | Account-gated with anti-bot protection |
| Google search | MANUAL_ONLY (disabled) | Automated querying violates terms; use Programmable Search API instead |
| MinistryJobs, ChristianJobs | UNREVIEWED | Terms not yet reviewed |
| Denominational boards | UNREVIEWED | Per-board policies vary; assess individually |

## Changing a policy

Before moving any source to `AUTOMATED_ALLOWED`:

1. Read that site's current Terms of Service.
2. Check its `robots.txt` for the paths involved.
3. Confirm no authentication or anti-bot system is in the way — if there is, the
   answer is no, regardless of technical feasibility.
4. Set a `rateLimitMs` that is genuinely polite.
5. Record the decision, the date, and the reasoning in this file.

Two things are never acceptable regardless of what a policy says: bypassing a
CAPTCHA or anti-bot system, and driving an authenticated session on the
candidate's behalf without them present.

## Why manual is not a failure mode

The manual path is not a degraded fallback. Vanderbloemen and Slingshot roles are
relationship-driven — a consultant conversation moves a candidate further than a
form submission would. For those sources, `npm run discover` prints ready-to-run
queries and how to get results back into the system. That is the workflow, not a
workaround.
