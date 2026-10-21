/**
 * Seeds every file under content/programs/<key>/<version>.json into the
 * portal_program_templates table. Safe to re-run — see planProgramTemplateSeed.
 *
 * Usage: npm run portal:seed-templates
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { loadAllProgramTemplateFiles, planProgramTemplateSeed } from "../src/lib/portal/programTemplates";

async function main() {
  const files = loadAllProgramTemplateFiles();
  if (files.length === 0) {
    console.log("No program template files found under content/programs/.");
    return;
  }

  for (const file of files) {
    const existing = await prisma.portalProgramTemplate.findUnique({
      where: { key_version: { key: file.body.key, version: file.body.version } },
      select: { id: true, status: true, sha256: true },
    });

    const plan = planProgramTemplateSeed(file, existing);
    const label = `${file.body.key}@${file.body.version}`;

    if (plan.action === "noop") {
      console.log(`= ${label} — unchanged`);
      continue;
    }

    const data = {
      key: file.body.key,
      version: file.body.version,
      title: file.body.title,
      body: file.body as unknown as Prisma.InputJsonValue,
      status: file.body.status,
      sha256: file.sha256,
      publishedAt: file.body.status === "published" ? new Date() : null,
    };

    if (plan.action === "create") {
      await prisma.portalProgramTemplate.create({ data });
      console.log(`+ ${label} — created (${file.body.status})`);
    } else {
      await prisma.portalProgramTemplate.update({ where: { id: plan.id }, data });
      console.log(`~ ${label} — updated (${file.body.status})`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
