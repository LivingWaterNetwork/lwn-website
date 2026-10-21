import { redirect } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import MemberNav from "./MemberNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const actor = await getPortalActor();
  if (!actor) redirect("/portal/login");

  return (
    <>
      <MemberNav />
      {children}
    </>
  );
}
