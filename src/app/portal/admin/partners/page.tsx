import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { listPartnerOrgsForAdmin } from "@/lib/portal/data/partners";
import { CreateOrgForm, AddPartnerUserForm, RevokePartnerUserButton } from "./PartnerForms";

export const metadata: Metadata = {
  title: "Partners",
  robots: { index: false, follow: false },
};

export default async function PartnersPage() {
  const actor = (await getPortalActor())!;
  if (!actor.isAdmin) redirect("/portal/admin");

  const orgs = (await listPartnerOrgsForAdmin(actor)) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Partners</h1>

      <div className="mt-6">
        <CreateOrgForm />
      </div>

      <ul className="mt-6 space-y-4">
        {orgs.map(({ org, users }) => (
          <li key={org.id} className="rounded-xl bg-mist p-4">
            <p className="font-serif text-lg text-navy">{org.name}</p>
            <p className="text-xs text-slate">{org.key}</p>
            <ul className="mt-2 space-y-1">
              {users.map(({ user, person }) => (
                <li key={user.id} className="flex items-center justify-between text-sm">
                  <span className="text-navy">
                    {person ? `${person.firstName} ${person.lastName} (${person.email})` : "Unknown"}
                  </span>
                  <RevokePartnerUserButton partnerUserId={user.id} />
                </li>
              ))}
            </ul>
            <AddPartnerUserForm partnerOrgId={org.id} />
          </li>
        ))}
        {orgs.length === 0 && <p className="text-sm text-slate">No partner organizations yet.</p>}
      </ul>
    </main>
  );
}
