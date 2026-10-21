import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listDocumentsForActor } from "@/lib/portal/data/documents";
import UploadDocumentForm from "@/app/portal/admin/UploadDocumentForm";
import VisibilityToggle from "@/app/portal/admin/VisibilityToggle";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default async function AdminDocumentsPage({ params }: { params: { id: string } }) {
  const actor = (await getPortalActor())!;
  const documents = (await listDocumentsForActor(actor, params.id)) ?? [];

  return (
    <div>
      <h2 className="font-serif text-xl text-navy">Documents</h2>
      <div className="mt-4">
        <UploadDocumentForm enrollmentId={params.id} />
      </div>
      <ul className="mt-4 space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between rounded-lg bg-mist p-3">
            <div>
              <p className="text-sm font-medium text-navy">{doc.title}</p>
              <p className="text-xs capitalize text-slate">{doc.kind.replace(/_/g, " ")}</p>
            </div>
            <VisibilityToggle documentId={doc.id} visibleToMember={doc.visibleToMember} />
          </li>
        ))}
        {documents.length === 0 && <p className="text-sm text-slate">No documents yet.</p>}
      </ul>
    </div>
  );
}
