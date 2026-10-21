import type { Metadata } from "next";
import Link from "next/link";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listStepsForActor } from "@/lib/portal/data/steps";
import { listMeetingsForActor } from "@/lib/portal/data/meetings";
import { listPhasesForActor } from "@/lib/portal/data/phases";
import { resolveCurrentPhaseKey } from "@/lib/portal/gamification";
import { bucketSteps } from "@/lib/portal/stepBuckets";
import SignOutButton from "./SignOutButton";
import HomeProgressCard from "./HomeProgressCard";
import LocalDateTime from "./LocalDateTime";

export const metadata: Metadata = {
  title: "Your LWN space",
  robots: { index: false, follow: false },
};

export default async function PortalHomePage() {
  const actor = (await getPortalActor())!; // layout already redirects unauthenticated requests

  const enrollment = await getViewedEnrollmentForActor(actor);
  const steps = enrollment ? ((await listStepsForActor(actor, enrollment.id)) ?? []) : [];
  const phases = enrollment ? ((await listPhasesForActor(actor, enrollment.id)) ?? []) : [];
  const meetings = enrollment ? await listMeetingsForActor(actor, enrollment.id) : null;
  const nextSession = (meetings ?? [])
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => (a.scheduledAt?.getTime() ?? Infinity) - (b.scheduledAt?.getTime() ?? Infinity))[0];

  const currentPhaseKey = resolveCurrentPhaseKey(phases, enrollment?.currentPhaseKey ?? null);
  const currentPhase = phases.find((p) => p.key === currentPhaseKey) ?? null;

  const buckets = bucketSteps(
    steps.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status as "open" | "done",
      dueOn: s.dueOn ? s.dueOn.toISOString() : null,
    }))
  );
  const thisWeekStepTitles = [...buckets.overdue, ...buckets.thisWeek].slice(0, 5);

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
          <HomeProgressCard
            steps={steps.map((s) => ({
              status: s.status as "open" | "done",
              doneAt: s.doneAt ? s.doneAt.toISOString() : null,
            }))}
          />

          <section className="rounded-xl bg-mist p-6">
            <h2 className="font-serif text-lg text-navy">Your journey</h2>
            <p className="mt-1 text-sm text-slate">
              {currentPhase ? `You're in the ${currentPhase.title} phase.` : "We'll mark where you are as soon as your journey starts."}
            </p>
            <Link href="/portal/journey" className="mt-2 inline-block text-sm font-medium text-lw-blue underline">
              See the full journey
            </Link>
          </section>

          <section className="rounded-xl bg-mist p-6">
            <h2 className="font-serif text-lg text-navy">Next session</h2>
            <p className="mt-1 text-sm text-slate">
              {nextSession?.scheduledAt ? (
                <LocalDateTime
                  iso={nextSession.scheduledAt.toISOString()}
                  fallback={nextSession.scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                />
              ) : (
                "We'll set a time together."
              )}
            </p>
          </section>

          <section className="rounded-xl bg-mist p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-navy">This week</h2>
              {steps.length > 0 && (
                <span className="rounded-full bg-copper/10 px-3 py-1 text-xs font-medium text-copper">
                  {buckets.done.length} of {steps.length} done
                </span>
              )}
            </div>
            {thisWeekStepTitles.length === 0 ? (
              <p className="mt-1 text-sm text-slate">
                {steps.length > 0 && buckets.done.length === steps.length
                  ? "All caught up — nice work! 🎉"
                  : "Nothing due this week — check back after your next session."}
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {thisWeekStepTitles.map((step) => (
                  <li key={step.id} className="flex items-center gap-2 text-sm text-navy">
                    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-copper" />
                    {step.title}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/portal/steps" className="mt-3 inline-block text-sm font-medium text-lw-blue underline">
              See all your steps
            </Link>
          </section>
        </div>
      )}
    </main>
  );
}
