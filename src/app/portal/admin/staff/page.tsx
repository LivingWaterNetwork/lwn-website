import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { listStaffForAdmin } from "@/lib/portal/data/staff";
import GrantStaffRoleForm from "./GrantStaffRoleForm";
import RevokeRoleButton from "./RevokeRoleButton";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false },
};

export default async function StaffPage() {
  const actor = (await getPortalActor())!;
  if (!actor.isAdmin) redirect("/portal/admin");

  const staff = (await listStaffForAdmin(actor)) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Staff</h1>

      <div className="mt-6">
        <GrantStaffRoleForm />
      </div>

      <ul className="mt-6 space-y-2">
        {staff.map(({ role, person }) => (
          <li key={role.id} className="flex items-center justify-between rounded-lg bg-mist p-3">
            <div>
              <p className="text-sm font-medium text-navy">
                {person ? `${person.firstName} ${person.lastName}` : "Unknown"}
              </p>
              <p className="text-xs capitalize text-slate">
                {role.role} · {person?.email}
              </p>
            </div>
            <RevokeRoleButton roleId={role.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
