# Browser automation

Playwright, headed by default so the candidate can watch and take the keyboard at
any moment.

## Two modes

**CAPTURE** (default) is read-only. It opens the application page, records what
the form asks — labels, field types, required flags, options, character limits —
and leaves. Nothing is typed and nothing is clicked. Captured questions run
through the answer resolver, and anything unresolved is filed in the human-input
queue.

```bash
npm run apply:assist -- --package=<id>
```

**FILL_DRAFT** fills fields that have an approved answer marked for automatic
use, and uploads approved documents.

```bash
npm run apply:assist -- --package=<id> --fill
```

`--fill` refuses to fill a partial application. If any question is unresolved it
stops and sends you to the queue, because a half-filled form is worse than an
empty one.

## Stop conditions

Automation halts and hands over the browser at:

| Stop | Behavior |
| --- | --- |
| CAPTCHA / bot challenge | Never attempted. Browser left open for you |
| MFA or verification code | Never handled. The agent does not touch credentials |
| Login wall | Never entered. You sign in yourself |
| Theological affirmation | Never affirmed, under any circumstances |
| Legal declaration or background-check consent | Never signed |
| Unexpected attestation | Never checked |
| Question with no approved answer | Filed to the queue |
| **The submit button** | Reaching it ends the run with a draft |

There is no flag, environment variable, or configuration that disables any of
these. Adding one would violate CLAUDE.md rules 5 and 6.

## The page is re-checked after filling

Forms reveal attestations and challenges conditionally, so the state that matters
is the state at the end. `runAssist` re-evaluates the page after filling and
stops if anything new appeared.

## Attestations are structural

The capture pass classifies a checkbox whose label reads like a promise
("I agree", "I certify", "statement of faith", "covenant") as an `ATTESTATION`
rather than a checkbox. The assist pass then skips every attestation by type,
not by pattern-matching at fill time.

## Authentication

Some sites require a logged-in session. The candidate signs in themselves in the
open browser window. Set `userDataDir` to persist a profile between runs if you
want a login to survive — the agent still never enters credentials.

## What is recorded

Every run creates an `AutomationRun` row: mode, status, stop reason, captured
questions, and timing. A run that stopped at a CAPTCHA is recorded as
`STOPPED_SAFETY` with the reason, so the history shows what happened and why.

## Chromium binary

Playwright normally manages its own browser. If your environment already has one
(or the bundled download fails), point at it explicitly:

```bash
export PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome
```

Both `browser/assist.ts` and `playwright.config.ts` honor this variable.

## E2E tests

`npm run test:e2e` runs dashboard smoke tests against a seeded database. They
assert the safety copy is actually in the UI — that the approve button is
disabled while blockers stand, that theology shows NOT YET DEFINED, and that the
candidate profile shows NOT PROVIDED rather than placeholder facts.

```bash
npm run setup && npm run seed:fixtures && npm run score && npm run report -- --prepare
npm run test:e2e
```
