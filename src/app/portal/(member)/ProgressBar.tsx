export default function ProgressBar({
  percent,
  label,
  trackClassName = "bg-navy/10",
  fillClassName = "bg-copper",
}: {
  percent: number;
  label?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={`h-2.5 w-full overflow-hidden rounded-full ${trackClassName}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${fillClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
