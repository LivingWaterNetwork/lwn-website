import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listInstallmentsForActor } from "@/lib/portal/data/installments";

export const metadata: Metadata = {
  title: "Your payments",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  due: "Due",
  paid: "Paid",
  adjusted: "Adjusted",
  waived: "Waived",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function PaymentsPage() {
  const actor = (await getPortalActor())!;
  const enrollment = await getViewedEnrollmentForActor(actor);
  const installments = enrollment ? ((await listInstallmentsForActor(actor, enrollment.id)) ?? []) : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 print:py-4">
      <h1 className="font-serif text-3xl text-navy">Your payments</h1>

      {installments.length === 0 ? (
        <p className="mt-6 text-slate">There&apos;s nothing scheduled here yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {installments.map((inst) => (
            <li key={inst.id} className="flex items-center justify-between rounded-xl bg-mist p-4">
              <div>
                <p className="text-sm font-medium text-navy">{inst.label}</p>
                <p className="text-xs text-slate">Due {new Date(inst.dueOn).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-navy">{formatAmount(inst.amountCents)}</p>
                <p className="text-xs text-slate">{STATUS_LABELS[inst.status] ?? inst.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {enrollment?.paymentUrl && (
        <a
          href={enrollment.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block min-h-[44px] rounded-lg bg-navy px-4 py-2 font-medium text-white hover:bg-deep-sea print:hidden"
        >
          Make a payment
        </a>
      )}
    </main>
  );
}
