import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PortalActor } from "../auth";
import { isStaff } from "../auth";
import { loadAllProgramTemplateFiles, planProgramTemplateSeed } from "../programTemplates";

/** Staff-only: every program template, any status — for the read-only /portal/admin/programs list. */
export async function listAllProgramTemplatesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  return prisma.portalProgramTemplate.findMany({ orderBy: [{ key: "asc" }, { version: "desc" }] });
}

/** Staff-only: published templates only — for the "create member" picker. */
export async function listPublishedProgramTemplatesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  return prisma.portalProgramTemplate.findMany({
    where: { status: "published" },
    orderBy: [{ key: "asc" }, { version: "desc" }],
  });
}

/** Staff-only: every active coach, for assignment dropdowns. */
export async function listCoachesForStaff(actor: PortalActor) {
  if (!isStaff(actor)) return null;
  const roles = await prisma.portalStaffRole.findMany({ where: { role: "coach", revokedAt: null } });
  const personIds = Array.from(new Set(roles.map((r) => r.personId)));
  return prisma.portalPerson.findMany({ where: { id: { in: personIds } }, orderBy: { firstName: "asc" } });
}

/**
 * Ungated bootstrap seed — no actor, by design: same purpose as
 * scripts/portal-seed-templates.ts, reachable from an operator-only,
 * non-actor context. Idempotent (see planProgramTemplateSeed). Never call
 * this from anywhere an ordinary actor request could reach.
 */
export async function seedProgramTemplatesFromContentFiles(): Promise<{ created: number; updated: number; noop: number }> {
  const files = loadAllProgramTemplateFiles();
  let created = 0;
  let updated = 0;
  let noop = 0;

  for (const file of files) {
    const existing = await prisma.portalProgramTemplate.findUnique({
      where: { key_version: { key: file.body.key, version: file.body.version } },
      select: { id: true, status: true, sha256: true },
    });
    const plan = planProgramTemplateSeed(file, existing);
    const data = {
      key: file.body.key,
      version: file.body.version,
      title: file.body.title,
      body: file.body as unknown as Prisma.InputJsonValue,
      status: file.body.status,
      sha256: file.sha256,
      publishedAt: file.body.status === "published" ? new Date() : null,
    };

    if (plan.action === "noop") {
      noop++;
    } else if (plan.action === "create") {
      await prisma.portalProgramTemplate.create({ data });
      created++;
    } else {
      await prisma.portalProgramTemplate.update({ where: { id: plan.id }, data });
      updated++;
    }
  }

  return { created, updated, noop };
}
