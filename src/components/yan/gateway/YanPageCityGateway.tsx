import Link from "next/link";
import { YAN_CITIES } from "@/lib/yanCities";
import { getCityStats, type YanStatCategory } from "@/lib/yanCityStats";

/**
 * National intro for one of the six directory pages (Network, Events, Leaders,
 * Pray, Resources, Stories). Explains the page's focus in general terms, then
 * hands the visitor off to their city's contextualized version at
 * `/yan/{pageSlug}/{citySlug}` — carrying one real, cited stat per city so the
 * choice is grounded in that city's actual context, not just a name on a list.
 */
export function YanPageCityGateway({
  pageSlug,
  eyebrow,
  title,
  intro,
  primaryCategory,
}: {
  pageSlug: string;
  eyebrow: string;
  title: string;
  intro: string;
  primaryCategory: YanStatCategory;
}) {
  return (
    <>
      <section className="py-16 sm:py-24 bg-yan-navy text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="yan-eyebrow yan-eyebrow-dark mb-3">{eyebrow}</p>
          <h1 className="yan-h1 text-white mb-5">{title}</h1>
          <p className="yan-body text-white/65 max-w-xl mx-auto">{intro}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-yan-stone">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="yan-eyebrow mb-3">Choose Your City</p>
            <h2 className="yan-h2 text-yan-navy">Every city, its own context.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {YAN_CITIES.map((city) => {
              const [stat] = getCityStats(city.slug, [primaryCategory]);
              return (
                <Link
                  key={city.slug}
                  href={`/yan/${pageSlug}/${city.slug}`}
                  className="group block rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow p-5 h-full flex flex-col"
                >
                  <span
                    className={`self-start text-[10px] font-yan-heading font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${
                      city.isFoundingHub ? "text-white bg-yan-blue" : "text-yan-navy bg-yan-stone"
                    }`}
                  >
                    {city.stageBadge}
                  </span>
                  <h3 className="yan-h3 !text-lg text-yan-navy mb-2">{city.name}</h3>
                  {stat && (
                    <p className="text-sm text-yan-navy/60 font-yan-body leading-snug mb-3 flex-1">
                      <span className="font-yan-heading font-bold text-yan-navy">{stat.value}</span> {stat.label}
                    </p>
                  )}
                  <span className="text-yan-blue text-sm font-semibold inline-flex items-center gap-1 mt-auto">
                    Explore {city.shortName}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
