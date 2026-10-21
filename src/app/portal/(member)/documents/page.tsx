import type { Metadata } from "next";
import { getPortalActor } from "@/lib/portal/auth";
import { getViewedEnrollmentForActor } from "@/lib/portal/data/enrollments";
import { listDocumentsForActor } from "@/lib/portal/data/documents";

export const metadata: Metadata = {
  title: "Your documents",
  robots: { index: false, follow: false },
};

const KIND_LABELS: Record<string, string> = {
  agreement: "Agreement",
  worksheet: "Worksheet",
  curriculum: "Curriculum",
  brand_website: "Brand & website",
  other: "Document",
};

export default async function DocumentsPage() {
  const actor = (await getPortalActor())!;
  const enrollment = await getViewedEnrollmentForActor(actor);

  const [enrollmentDocs, libraryDocs] = await Promise.all([
    enrollment ? listDocumentsForActor(actor, enrollment.id) : Promise.resolve([]),
    listDocumentsForActor(actor, null),
  ]);

  const documents = [...(enrollmentDocs ?? []), ...(libraryDocs ?? [])];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-navy">Your documents</h1>

      {documents.length === 0 ? (
        <p className="mt-6 text-slate">Nothing here yet — your documents will show up as they&apos;re ready.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between rounded-xl bg-mist p-4">
              <div>
                <p className="text-sm font-medium text-navy">{doc.title}</p>
                <p className="text-xs text-slate">
                  {KIND_LABELS[doc.kind] ?? doc.kind} · {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/portal/documents/${doc.id}/download`}
                className="min-h-[44px] rounded-lg border border-slate/30 px-3 py-2 text-sm font-medium text-navy hover:bg-white"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
