/**
 * Creates a login challenge for a test-only portal person and prints the
 * code to this local terminal — never emails it, never returns it from any
 * API route. Refuses any person who isn't is_test.
 *
 * Usage: npm run portal:test-login -- --email test-a@example.com
 *
 * Never paste this script's output into a PR, report, screenshot, or commit.
 */
import { prisma } from "../src/lib/prisma";
import { startPortalLogin } from "../src/lib/portal/data/auth";
import { normalizeEmail } from "../src/lib/portal/crypto";

function getArg(name: string): string | undefined {
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const email = getArg("email");
  if (!email) {
    console.error("Usage: npm run portal:test-login -- --email test-a@example.com");
    process.exitCode = 1;
    return;
  }

  const person = await prisma.portalPerson.findUnique({ where: { email: normalizeEmail(email) } });
  if (!person) {
    console.error(`No portal_persons row for ${email}.`);
    process.exitCode = 1;
    return;
  }
  if (!person.isTest) {
    console.error(`${email} is not a test record (is_test = false). Refusing to print a real sign-in code.`);
    process.exitCode = 1;
    return;
  }

  const result = await startPortalLogin(email, null, "portal:test-login script");
  if (!result.person) {
    console.error(`Login request was throttled for ${email}. Try again later.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Code for ${email}: ${result.code}`);
  console.log(`(Expires in 10 minutes. Do not paste this into a PR, report, screenshot, or commit.)`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
