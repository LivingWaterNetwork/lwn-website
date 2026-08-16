import type { YanCityStat } from "@/lib/yanCityStats";

/**
 * Renders a row of researched, cited statistics with a numbered footnote list.
 * Every figure shown here must come from `yanCityStats.ts` — never invent a
 * number here. `dark` swaps the card styling for use on navy-background sections.
 */
export function YanStatsStrip({
  stats,
  dark = false,
  eyebrow = "In This City",
}: {
  stats: YanCityStat[];
  dark?: boolean;
  eyebrow?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <div>
      <p className={`yan-eyebrow ${dark ? "yan-eyebrow-dark" : ""} mb-4 text-center`}>{eyebrow}</p>
      <div className={`grid sm:grid-cols-2 ${stats.length > 2 ? "lg:grid-cols-4" : ""} gap-4 mb-6`}>
        {stats.map((stat, i) => (
          <div
            key={`${stat.category}-${i}`}
            className={dark ? "yan-card-dark" : "yan-card"}
          >
            <p className={`text-3xl font-yan-heading font-bold mb-1 ${dark ? "text-white" : "text-yan-navy"}`}>
              {stat.value}
            </p>
            <p className={`text-sm font-yan-body leading-snug mb-2 ${dark ? "text-white/70" : "text-yan-navy/65"}`}>
              {stat.label}
            </p>
            <p className={`text-xs font-yan-body leading-relaxed ${dark ? "text-white/50" : "text-yan-navy/50"}`}>
              {stat.context}
            </p>
          </div>
        ))}
      </div>
      <ol className={`text-[11px] font-yan-body leading-relaxed space-y-1 ${dark ? "text-white/40" : "text-yan-navy/35"}`}>
        {stats.map((stat, i) => (
          <li key={`source-${stat.category}-${i}`}>
            {i + 1}. {stat.source}, {stat.year} — {stat.geography}.{" "}
            <a href={stat.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline">
              Source
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
