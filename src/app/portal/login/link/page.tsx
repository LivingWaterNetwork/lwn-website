import type { Metadata } from "next";
import ContinueButton from "./ContinueButton";

export const metadata: Metadata = {
  title: "Continue to your LWN space",
  robots: { index: false, follow: false },
};

// This page never signs anyone in on its own GET — it only shows a button
// that the person themselves has to tap, which then POSTs. That way an
// email client or security scanner that prefetches links in an inbox can't
// spend a one-time sign-in link just by loading the page.
export default function PortalLoginLinkPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl bg-mist p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-navy">Almost there.</h1>
        <p className="mt-2 text-sm text-slate">Tap below to finish signing in to your LWN space.</p>
        {token ? (
          <ContinueButton token={token} />
        ) : (
          <p className="mt-6 text-sm text-copper">This link is missing its code. Request a new one from the sign-in page.</p>
        )}
      </div>
    </main>
  );
}
