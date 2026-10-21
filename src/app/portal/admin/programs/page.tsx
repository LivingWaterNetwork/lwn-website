import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listAllProgramTemplatesForStaff } from "@/lib/portal/data/templates";

export const metadata: Metadata = {
  title: "Programs",
  robots: { index: false, follow: false },
};

export default async function ProgramsPage() {
  const actor = (await getPortalActor())!;
  const templates = (await listAllProgramTemplatesForStaff(actor)) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Programs</h1>
      <p className="mt-1 text-sm text-slate">
        Read-only. Add a new version by editing content/programs/ and running portal:seed-templates.
      </p>

      <ul className="mt-6 space-y-2">
        {templates.map((t) => (
          <li key={t.id} className="rounded-lg bg-mist p-4">
            <p className="text-sm font-medium text-navy">
              {t.title} <span className="text-slate">v{t.version}</span>
            </p>
            <p className="text-xs capitalize text-slate">
              {t.key} · {t.status}
            </p>
          </li>
        ))}
        {templates.length === 0 && <p className="text-sm text-slate">No templates seeded yet.</p>}
      </ul>
    </main>
  );
}
