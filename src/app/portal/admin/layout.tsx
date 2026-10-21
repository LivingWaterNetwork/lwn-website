import { redirect } from "next/navigation";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getPortalActor();
  if (!actor) redirect("/portal/login");
  if (!isStaff(actor)) redirect("/portal");

  return (
    <>
      <AdminNav isAdmin={actor.isAdmin} />
      {children}
    </>
  );
}
