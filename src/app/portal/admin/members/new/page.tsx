import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listPublishedProgramTemplatesForStaff, listCoachesForStaff } from "@/lib/portal/data/templates";
import NewMemberForm from "./NewMemberForm";

export const metadata: Metadata = {
  title: "Create member",
  robots: { index: false, follow: false },
};

export default async function NewMemberPage() {
  const actor = (await getPortalActor())!;
  const [templates, coaches] = await Promise.all([
    listPublishedProgramTemplatesForStaff(actor),
    listCoachesForStaff(actor),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Create member</h1>
      <p className="mt-1 text-sm text-slate">Creates a draft enrollment. Nothing is sent yet.</p>
      <NewMemberForm
        templates={(templates ?? []).map((t) => ({ key: t.key, title: t.title }))}
        coaches={(coaches ?? []).map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))}
        isAdmin={actor.isAdmin}
      />
    </main>
  );
}
