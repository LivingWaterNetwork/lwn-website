/**
 * Creates a new agreement from a published template and prints its URL and
 * one-time access code. This is the CLI half of the same code path the admin
 * dashboard's "Create" action uses (src/lib/agreements/service.ts) — nothing
 * here is one-off to Amaya's agreement.
 *
 * Usage:
 *   npm run agreement:new -- \
 *     --template lwn-coaching-business-launch \
 *     --version 1.0.0 \
 *     --name "Amaya Frias" \
 *     --email amayaf1315@gmail.com \
 *     --vars content/agreements/lwn-coaching-business-launch/instances/amaya-frias-revival-skn.vars.json \
 *     [--test]
 *
 * The access code is shown exactly once here, as plaintext — it is never
 * stored, only its scrypt hash is. Copy it now; regenerating it from the
 * admin dashboard invalidates this one.
 */
import fs from "fs";
import { prisma } from "../src/lib/prisma";
import { createAgreementFromTemplate, issueAccessCode, type SignerInput } from "../src/lib/agreements/service";

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

type VarsFile = {
  variables: Record<string, unknown>;
  signers: SignerInput[];
  paymentUrl?: string;
  expiresInDays?: number;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const templateKey = args.template as string | undefined;
  const name = args.name as string | undefined;
  const email = args.email as string | undefined;
  const varsPath = args.vars as string | undefined;

  if (!templateKey || !name || !email || !varsPath) {
    console.error(
      "Usage: npm run agreement:new -- --template <key> --version <semver> --name \"Full Name\" --email you@example.com --vars path/to/vars.json [--test]"
    );
    process.exitCode = 1;
    return;
  }

  let templateVersion = args.version as string | undefined;
  if (!templateVersion) {
    const latest = await prisma.agreementTemplate.findFirst({
      where: { key: templateKey, status: "published" },
      orderBy: { publishedAt: "desc" },
      select: { version: true },
    });
    if (!latest) {
      console.error(`No published version found for template "${templateKey}". Run "npm run agreement:seed-templates" first, or pass --version explicitly.`);
      process.exitCode = 1;
      return;
    }
    templateVersion = latest.version;
  }

  const varsFile: VarsFile = JSON.parse(fs.readFileSync(varsPath, "utf8"));

  const agreement = await createAgreementFromTemplate({
    templateKey,
    templateVersion,
    name,
    email,
    variables: varsFile.variables,
    signers: varsFile.signers,
    paymentUrl: varsFile.paymentUrl,
    expiresInDays: varsFile.expiresInDays,
    isTest: Boolean(args.test),
  });

  const code = await issueAccessCode(agreement.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lwnetwork.org";
  console.log("");
  console.log(`Agreement created (status: draft): ${agreement.id}`);
  console.log(`  Link: ${siteUrl}/agreements/${agreement.slug}`);
  console.log(`  Access code (shown once — store it securely): ${code}`);
  console.log("");
  console.log("Next: open it in the admin dashboard to preview, mark ready, record MMG's partner acceptance, then send.");
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
