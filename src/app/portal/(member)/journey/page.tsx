import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listPhasesForActor } from "@/lib/portal/data/phases";

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

  const today = new Date();
  const youAreHereKey =
    enrollment.currentPhaseKey ??
    phases.find((p) => p.startsOn && p.endsOn && p.startsOn <= today && today <= p.endsOn)?.key ??
    phases[0]?.key;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 print:py-4">
      <h1 className="font-serif text-3xl text-navy">Your journey</h1>
      <p className="mt-1 text-sm text-slate">
        {enrollment.startDate && enrollment.endDate
          ? `${new Date(enrollment.startDate).toLocaleDateString()} – ${new Date(enrollment.endDate).toLocaleDateString()}`
          : "Dates to be confirmed."}
      </p>

      <ol className="mt-8 space-y-6">
        {phases.map((phase) => {
          const isHere = phase.key === youAreHereKey;
          return (
            <li
              key={phase.id}
              className={`rounded-xl p-6 print:rounded-none print:border print:bg-white print:p-4 ${
                isHere ? "bg-navy text-white print:border-2 print:border-navy print:text-navy" : "bg-mist text-navy print:border-slate/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl">{phase.title}</h2>
                {isHere && (
                  <span className="rounded-full bg-copper px-3 py-1 text-xs font-medium text-white print:border print:border-copper print:bg-white print:text-copper">
                    You are here
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm print:text-slate ${isHere ? "text-mist" : "text-slate"}`}>{phase.summary}</p>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
