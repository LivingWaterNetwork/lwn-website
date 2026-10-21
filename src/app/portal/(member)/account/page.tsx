import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listEnrollmentsForActor, getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { ProgramSwitcher, SignOutEverywhereButton, DownloadDataButton } from "./AccountControls";
import SignOutButton from "../SignOutButton";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const actor = (await getPortalActor())!;
  const enrollments = await listEnrollmentsForActor(actor);
  const viewed = await getViewedEnrollmentForActor(actor);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-navy">Account</h1>

      <section className="mt-6 rounded-xl bg-mist p-6">
        <p className="text-sm text-slate">Name</p>
        <p className="text-navy">
          {actor.firstName} {actor.lastName}
        </p>
        <p className="mt-4 text-sm text-slate">Email</p>
        <p className="text-navy">{actor.email}</p>
      </section>

      {enrollments.length > 1 && viewed && (
        <section className="mt-6 rounded-xl bg-mist p-6">
          <ProgramSwitcher
            enrollments={enrollments.map((e) => ({
              id: e.id,
              title:
                (e.templateSnapshot as { title?: string } | null)?.title ?? "LWN Program",
            }))}
            activeId={viewed.id}
          />
        </section>
      )}

      <section className="mt-6 flex flex-wrap gap-3">
        <DownloadDataButton />
        <SignOutButton />
        <SignOutEverywhereButton />
      </section>
    </main>
  );
}
