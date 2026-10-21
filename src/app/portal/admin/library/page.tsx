import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { listDocumentsForActor } from "@/lib/portal/data/documents";
import UploadDocumentForm from "@/app/portal/admin/UploadDocumentForm";
import VisibilityToggle from "@/app/portal/admin/VisibilityToggle";

export const metadata: Metadata = {
  title: "Program library",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const actor = (await getPortalActor())!;
  const documents = (await listDocumentsForActor(actor, null)) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-3xl text-navy">Program library</h1>
      <p className="mt-1 text-sm text-slate">
        Shared materials (like <em>At the Table</em>) available to every member, not tied to one enrollment.
      </p>

      <div className="mt-6">
        <UploadDocumentForm enrollmentId={null} />
      </div>

      <ul className="mt-6 space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between rounded-lg bg-mist p-3">
            <div>
              <p className="text-sm font-medium text-navy">{doc.title}</p>
              <p className="text-xs capitalize text-slate">{doc.kind.replace(/_/g, " ")}</p>
            </div>
            <VisibilityToggle documentId={doc.id} visibleToMember={doc.visibleToMember} />
          </li>
        ))}
        {documents.length === 0 && <p className="text-sm text-slate">Nothing uploaded yet.</p>}
      </ul>
    </main>
  );
}
