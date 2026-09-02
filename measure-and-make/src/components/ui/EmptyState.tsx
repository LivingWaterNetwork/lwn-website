/**
 * Honest empty state. Used wherever a list has nothing verified to show yet —
 * never a placeholder card, metric, or testimonial standing in for real content.
 */
export function EmptyState({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`border border-dashed border-field/40 bg-limestone-light px-6 py-12 text-center ${className}`}
    >
      <p className="mx-auto max-w-prose font-sans text-base text-field">
        {message}
      </p>
    </div>
  );
}
