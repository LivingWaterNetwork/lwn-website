import { redirect } from "next/navigation";
import { getPortalActor, isStaff } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import MemberNav from "./MemberNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const actor = await getPortalActor();
  if (!actor) redirect("/portal/login");

  const enrollment = await getViewedEnrollmentForActor(actor);
  const modules = (enrollment?.modules as Record<string, boolean> | null) ?? {};

  return (
    <>
      <MemberNav showPayments={Boolean(modules.payments)} isStaff={isStaff(actor)} />
      {children}
    </>
  );
}
