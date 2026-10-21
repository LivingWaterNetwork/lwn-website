import { notFound } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { getEnrollmentForActor } from "@/lib/portal/data/enrollments";
import EnrollmentTabs from "./EnrollmentTabs";

export default async function EnrollmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const actor = (await getPortalActor())!;
  const enrollment = await getEnrollmentForActor(actor, params.id);
  if (!enrollment) notFound();

  const title = (enrollment.templateSnapshot as { title?: string } | null)?.title ?? "Enrollment";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">{title}</h1>
      <p className="mt-1 text-sm capitalize text-slate">{enrollment.status}</p>
      <EnrollmentTabs enrollmentId={params.id} />
      <div className="mt-6">{children}</div>
    </main>
  );
}
