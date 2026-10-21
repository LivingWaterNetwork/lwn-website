import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listEnrollmentsForActor } from "@/lib/portal/data/enrollments";
import { listStepsForActor } from "@/lib/portal/data/steps";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "Your LWN space",
  robots: { index: false, follow: false },
};

export default async function PortalHomePage() {
  const actor = await getPortalActor();
  if (!actor) redirect("/portal/login");

  const enrollments = await listEnrollmentsForActor(actor);
  const enrollment = enrollments.find((e) => e.status === "active") ?? enrollments[0] ?? null;
  const steps = enrollment ? await listStepsForActor(actor, enrollment.id) : null;
  const openStepsThisWeek = (steps ?? []).filter((s) => s.status === "open").slice(0, 5);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-navy">Welcome, {actor.firstName}.</h1>
        <SignOutButton />
      </div>

      {!enrollment && (
        <p className="mt-6 rounded-xl bg-mist p-6 text-slate">
          Your program hasn&apos;t been set up here yet. We&apos;ll let you know as soon as it&apos;s ready.
        </p>
      )}

      {enrollment && (
        <div className="mt-6 space-y-6">
          <section className="rounded-xl bg-mist p-6">
            <h2 className="font-serif text-lg text-navy">Your journey</h2>
            <p className="mt-1 text-sm text-slate">
              {enrollment.currentPhaseKey
                ? `You're in the ${enrollment.currentPhaseKey} phase.`
                : "We'll mark where you are as soon as your journey starts."}
            </p>
          </section>

          <section className="rounded-xl bg-mist p-6">
            <h2 className="font-serif text-lg text-navy">This week</h2>
            {openStepsThisWeek.length === 0 ? (
              <p className="mt-1 text-sm text-slate">Nothing due this week — check back after your next session.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {openStepsThisWeek.map((step) => (
                  <li key={step.id} className="text-sm text-navy">
                    {step.title}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
