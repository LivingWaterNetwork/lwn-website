import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listInstallmentsForActor } from "@/lib/portal/data/installments";
import InstallmentActions from "./InstallmentActions";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function AdminPaymentsPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const installments = (await listInstallmentsForActor(actor, params.id)) ?? [];

  return (
    <div>
      <h2 className="font-serif text-xl text-navy">Payments</h2>
      <ul className="mt-4 space-y-3">
        {installments.map((inst) => (
          <li key={inst.id} className="rounded-lg bg-mist p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">{inst.label}</p>
                <p className="text-xs text-slate">
                  Due {new Date(inst.dueOn).toLocaleDateString()} · {formatAmount(inst.amountCents)} ·{" "}
                  <span className="capitalize">{inst.status}</span>
                </p>
                {inst.note && <p className="mt-1 text-xs italic text-slate">{inst.note}</p>}
              </div>
              <InstallmentActions installmentId={inst.id} />
            </div>
          </li>
        ))}
        {installments.length === 0 && <p className="text-sm text-slate">No installments yet.</p>}
      </ul>
    </div>
  );
}
