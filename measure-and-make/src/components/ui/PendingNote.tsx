/**
 * A visible, honest marker for content the founder has not supplied yet. Used
 * instead of inventing plausible-sounding copy (01-BRAND-FOUNDATION.md §12,
 * 08-OPEN-DECISIONS.md #2). It is deliberately conspicuous: it should be
 * uncomfortable to leave on the site at launch.
 */
export function PendingNote({ children }: { children: string }) {
  return (
    <p className="max-w-prose border-l-2 border-brass bg-limestone-light px-5 py-4 font-sans text-sm leading-relaxed text-field">
      <span className="font-semibold uppercase tracking-eyebrow text-brass-dark">
        Pending
      </span>
      <span className="mt-2 block">{children}</span>
    </p>
  );
}
