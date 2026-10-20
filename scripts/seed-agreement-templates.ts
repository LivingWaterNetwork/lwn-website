/**
 * Seeds every template file under content/agreements/<key>/<version>.md into
 * the agreement_templates table. Safe to re-run: a template whose file is
 * unchanged is a no-op, a draft can be updated in place, and a published
 * version whose file content changed throws (TemplateImmutabilityError) —
 * ship a new version file instead of editing a published one.
 *
 * Usage: npm run agreement:seed-templates
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { loadAllTemplateFiles, planTemplateSeed } from "../src/lib/agreements/templates";

async function main() {
  const files = loadAllTemplateFiles();
  if (files.length === 0) {
    console.log("No template files found under content/agreements/.");
    return;
  }

  for (const file of files) {
    const existing = await prisma.agreementTemplate.findUnique({
      where: { key_version: { key: file.frontmatter.key, version: file.frontmatter.version } },
      select: { id: true, status: true, contentSha256: true },
    });

    const plan = planTemplateSeed(file, existing);
    const label = `${file.frontmatter.key}@${file.frontmatter.version}`;

    if (plan.action === "noop") {
      console.log(`= ${label} — unchanged`);
      continue;
    }

    const data = {
      key: file.frontmatter.key,
      version: file.frontmatter.version,
      title: file.frontmatter.title,
      body: file.body,
      variablesSchema: file.frontmatter.variablesSchema as Prisma.InputJsonValue,
      signerRoles: file.frontmatter.signerRoles as Prisma.InputJsonValue,
      requiredInitials: file.frontmatter.requiredInitials as Prisma.InputJsonValue,
      contentSha256: file.contentSha256,
      status: file.frontmatter.status,
      publishedAt: file.frontmatter.status === "published" ? new Date() : null,
    };

    if (plan.action === "create") {
      await prisma.agreementTemplate.create({ data });
      console.log(`+ ${label} — created (${file.frontmatter.status})`);
    } else {
      await prisma.agreementTemplate.update({ where: { id: plan.id }, data });
      console.log(`~ ${label} — updated (${file.frontmatter.status})`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
