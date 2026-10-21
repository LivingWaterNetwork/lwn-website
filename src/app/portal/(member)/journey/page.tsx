import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listPhasesForActor } from "@/lib/portal/data/phases";
import { computePhaseStates, resolveCurrentPhaseKey } from "@/lib/portal/gamification";

export const metadata: Metadata = {
  title: "Your journey",
  robots: { index: false, follow: false },
};

export default async function JourneyPage() {
  const actor = (await getPortalActor())!;
  const enrollment = await getViewedEnrollmentForActor(actor);

  if (!enrollment) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 print:py-4">
        <h1 className="font-serif text-3xl text-navy">Your journey</h1>
        <p className="mt-4 text-slate">Your program hasn&apos;t been set up here yet.</p>
      </main>
    );
  }

  const phases = (await listPhasesForActor(actor, enrollment.id)) ?? [];

  const youAreHereKey = resolveCurrentPhaseKey(phases, enrollment.currentPhaseKey);
  const phaseStates = computePhaseStates(phases, youAreHereKey);
  const completedCount = phaseStates.filter((p) => p.state === "done").length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 print:py-4">
      <h1 className="font-serif text-3xl text-navy">Your journey</h1>
      <p className="mt-1 text-sm text-slate">
        {enrollment.startDate && enrollment.endDate
          ? `${new Date(enrollment.startDate).toLocaleDateString()} – ${new Date(enrollment.endDate).toLocaleDateString()}`
          : "Dates to be confirmed."}
      </p>

      {phases.length > 0 && (
        <p className="mt-4 text-sm font-medium text-slate print:hidden">
          {completedCount} of {phases.length} phases complete
        </p>
      )}

      <ol className="mt-8">
        {phaseStates.map((phase, i) => {
          const isLast = i === phaseStates.length - 1;
          return (
            <li key={phase.id} className="relative pl-12 print:pl-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-0.5 print:hidden ${
                    phase.state === "done" ? "bg-copper" : "bg-navy/15"
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold print:hidden ${
                  phase.state === "done"
                    ? "bg-copper text-white"
                    : phase.state === "current"
                      ? "bg-navy text-white ring-4 ring-navy/20"
                      : "bg-navy/10 text-slate"
                }`}
              >
                {phase.state === "done" ? "✓" : i + 1}
              </span>

              <div
                className={`mb-6 rounded-xl p-6 print:rounded-none print:border print:bg-white print:p-4 ${
                  phase.state === "current"
                    ? "bg-navy text-white print:border-2 print:border-navy print:text-navy"
                    : "bg-mist text-navy print:border-slate/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl">{phase.title}</h2>
                  {phase.state === "current" && (
                    <span className="rounded-full bg-copper px-3 py-1 text-xs font-medium text-white print:border print:border-copper print:bg-white print:text-copper">
                      You are here
                    </span>
                  )}
                  {phase.state === "done" && (
                    <span className="rounded-full bg-copper/10 px-3 py-1 text-xs font-medium text-copper print:hidden">
                      Complete
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm print:text-slate ${phase.state === "current" ? "text-mist" : "text-slate"}`}>
                  {phase.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
