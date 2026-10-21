import type { Metadata } from "next";
import Link from "next/link";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listStepsForActor } from "@/lib/portal/data/steps";
import { listMeetingsForActor } from "@/lib/portal/data/meetings";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "Your LWN space",
  robots: { index: false, follow: false },
};

export default async function PortalHomePage() {
  const actor = (await getPortalActor())!; // layout already redirects unauthenticated requests

  const enrollment = await getViewedEnrollmentForActor(actor);
  const steps = enrollment ? await listStepsForActor(actor, enrollment.id) : null;
  const openStepsThisWeek = (steps ?? []).filter((s) => s.status === "open").slice(0, 5);
  const meetings = enrollment ? await listMeetingsForActor(actor, enrollment.id) : null;
  const nextSession = (meetings ?? [])
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => (a.scheduledAt?.getTime() ?? Infinity) - (b.scheduledAt?.getTime() ?? Infinity))[0];

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
            <Link href="/portal/journey" className="mt-2 inline-block text-sm font-medium text-lw-blue underline">
              See the full journey
            </Link>
          </section>

          <section className="rounded-xl bg-mist p-6">
            <h2 className="font-serif text-lg text-navy">Next session</h2>
            <p className="mt-1 text-sm text-slate">
              {nextSession?.scheduledAt
                ? new Date(nextSession.scheduledAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "We'll set a time together."}
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
            <Link href="/portal/steps" className="mt-2 inline-block text-sm font-medium text-lw-blue underline">
              See all your steps
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}
