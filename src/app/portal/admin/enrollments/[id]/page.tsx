import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortalActor } from "@/lib/portal/auth";
import { getEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listPhasesForActor } from "@/lib/portal/data/phases";
import { listCoachesForStaff } from "@/lib/portal/data/templates";
import { listPartnerOrgsForStaff, listPartnerGrantsForStaff } from "@/lib/portal/data/partners";
import EnrollmentEditForm from "./EnrollmentEditForm";
import { InviteButton, StatusActions } from "./EnrollmentActions";
import PartnerGrants from "./PartnerGrants";

export const metadata: Metadata = {
  title: "Enrollment overview",
  robots: { index: false, follow: false },
};

export default async function EnrollmentOverviewPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const enrollment = await getEnrollmentForActor(actor, params.id);
  if (!enrollment) notFound();

  const [phases, coaches, partnerOrgs, partnerGrants] = await Promise.all([
    listPhasesForActor(actor, params.id),
    listCoachesForStaff(actor),
    listPartnerOrgsForStaff(actor),
    listPartnerGrantsForStaff(actor, params.id),
  ]);

  const inviteDisabledReason = enrollment.isTest
    ? "Test records never receive sign-in emails."
    : process.env.VERCEL_ENV !== "production"
      ? "Invites only send from Production."
      : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusActions enrollmentId={enrollment.id} status={enrollment.status} />
        <InviteButton enrollmentId={enrollment.id} disabledReason={inviteDisabledReason} />
      </div>

      <EnrollmentEditForm
        enrollmentId={enrollment.id}
        phases={(phases ?? []).map((p) => ({ key: p.key, title: p.title }))}
        currentPhaseKey={enrollment.currentPhaseKey}
        modules={(enrollment.modules as Record<string, boolean>) ?? {}}
        paymentUrl={enrollment.paymentUrl}
        agreementId={enrollment.agreementId}
        coaches={(coaches ?? []).map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))}
        coachPersonId={enrollment.coachPersonId}
        isAdmin={actor.isAdmin}
      />

      <PartnerGrants
        enrollmentId={enrollment.id}
        orgs={(partnerOrgs ?? []).map((o) => ({ id: o.id, name: o.name }))}
        grants={(partnerGrants ?? []).map((g) => ({ id: g.id, partnerOrgId: g.partnerOrgId, grantedVia: g.grantedVia }))}
      />
    </div>
  );
}
