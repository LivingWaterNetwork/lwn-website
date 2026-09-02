# Contact form: setup and post-configuration test

The form at `/measure-and-make/start` writes to Airtable server-side. Until the
token below is installed the form saves nothing and says so; it never shows a
success message it has not earned.

## 1. The one environment variable

| Variable            | Required | Value                                                                                                 |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `AIRTABLE_API_KEY`  | **yes**  | An Airtable personal access token, scoped to `data.records:write` on the **Measure & Make** base only |
| `AIRTABLE_BASE_ID`  | yes      | `appKznUQ11agoIbcs` (already in `.env.example`)                                                       |
| `AIRTABLE_TABLE_ID` | yes      | `tblgc13tluLMgJHgo` (already in `.env.example`)                                                       |

Create the token at <https://airtable.com/create/tokens>:

1. Name it something like `measure-and-make-website`.
2. Scopes: `data.records:write`. Nothing else — the site never reads records.
3. Access: add **only** the `Measure & Make` base.
4. Copy the token once (Airtable will not show it again).

Install it as a secret in the deployment environment. Locally:

```bash
cp .env.example .env.local
# paste the token after AIRTABLE_API_KEY=
npm run dev
```

`.env.local` is git-ignored. Never commit a token; if one is ever pasted into a
commit, revoke it in Airtable immediately and issue a new one.

The token is read only by `src/lib/airtable.ts`, which begins with
`import "server-only"` — the build fails if that module is ever pulled into
client code, so the credential cannot reach a browser. There is no
`NEXT_PUBLIC_` variable anywhere in this app.

## 2. Turn on the email notification

The Airtable base carries an automation, `Email new inquiry to ...`
(`wflq3djrWd5vj2mmL`), which emails the inbox whenever a record is created. It
is saved as a **draft** and sends nothing until enabled:

1. Open <https://airtable.com/appKznUQ11agoIbcs/wflq3djrWd5vj2mmL>.
2. **Change the recipient** to a Measure & Make address. It is currently
   addressed to Living Water Network's nonprofit inbox, which should not receive
   Measure & Make's commercial inquiries.
3. Use **Test** to send yourself one.
4. Toggle the automation **on**.

## 3. Post-configuration test procedure

Run this once after the token is installed, in the environment that has it.

**Test A — a real submission is saved.**

1. Open `/measure-and-make/start`.
2. Fill in Name, Organization, Email, and Project details. Add a website, an
   organization type, a timeline, a budget range, and one or more interests.
3. Submit.
4. Expect: the thank-you message replaces the form.
5. In Airtable, open the `Inquiries` table. Expect one new row with every value
   you entered, `Submitted At` set, `Status` = `New`, and `Source` =
   `measure-and-make website contact form`.
6. Expect the notification email in the inbox (only if step 2 above is done).
7. Delete the test row.

**Test B — the form rejects bad input rather than saving it.**

1. Submit with the Name blank and the Email set to `not-an-email`.
2. Expect: no thank-you; the validation message appears; both fields are
   outlined and carry an error beneath them.
3. Expect: no new Airtable row.

**Test C — success is never faked.**

1. Temporarily unset `AIRTABLE_API_KEY` and restart.
2. Submit a complete, valid inquiry.
3. Expect: the message that the form is not connected and **nothing was saved** —
   never a thank-you.
4. Restore the token.

**Test D — the credential is not in the browser.**

1. Load `/measure-and-make/start`, open DevTools, and search all loaded scripts
   for `AIRTABLE`, `airtable.com`, and the token's first characters.
2. Expect: no match. The only network call the page makes on submit is to
   `/measure-and-make/api/contact` on this site.

**Test E — rate limiting holds.**

1. Submit six valid inquiries in quick succession from the same connection.
2. Expect: the sixth is refused with the rate-limit message, and Airtable shows
   five rows, not six.
3. Delete the test rows.

## 4. What the visitor sees, in every case

| Server result               | HTTP | Message                                        |
| --------------------------- | ---- | ---------------------------------------------- |
| Record written              | 200  | The thank-you message                          |
| Validation failed           | 400  | The validation message, plus a per-field error |
| Honeypot filled             | 400  | Same as validation; nothing is saved           |
| Too many submissions        | 429  | Not sent; try again in a few minutes           |
| No Airtable credential      | 503  | Not connected here; nothing was saved          |
| Airtable rejected the write | 502  | Not sent and nothing was saved; try again      |
