/**
 * Real, cited statistics used to ground each city hub in its actual context —
 * young-adult demographics, faith engagement, mental health, justice-system
 * involvement, homelessness, loneliness, and church-growth momentum. Every
 * figure here must trace to a named, dated, public source; never invent or
 * round-for-effect. When no city-specific figure exists, the stat uses the
 * closest available geography and says so plainly in `geography`.
 */

export type YanStatCategory =
  | "youngAdults"
  | "faith"
  | "mentalHealth"
  | "justice"
  | "homelessness"
  | "loneliness"
  | "engagement";

export interface YanCityStat {
  category: YanStatCategory;
  /** The number/percentage itself, e.g. "23.2%" */
  value: string;
  /** Short label under the value, e.g. "of New Yorkers are ages 18–34" */
  label: string;
  /** One plain-language sentence of context for a nonprofit-ministry audience. */
  context: string;
  /** The geography this figure actually covers, when narrower/broader than the city itself. */
  geography: string;
  source: string;
  year: string;
  url: string;
}

export const YAN_STAT_CATEGORY_LABELS: Record<YanStatCategory, string> = {
  youngAdults: "Young Adults",
  faith: "Faith & Church Engagement",
  mentalHealth: "Mental Health",
  justice: "Justice-System Involvement",
  homelessness: "Homelessness & Housing",
  loneliness: "Loneliness & Isolation",
  engagement: "Momentum & Growth",
};

export const YAN_CITY_STATS: Record<string, YanCityStat[]> = {
  atlanta: [
    {
      category: "youngAdults",
      value: "11.8%",
      label: "of Atlanta's population is age 25–29 — its single largest age group",
      context: "Young adults make up the largest single age segment of Atlanta's population, one of the youngest major metros in the country.",
      geography: "City of Atlanta",
      source: "U.S. Census Bureau, American Community Survey 2017–2021 5-Year Estimates (via Census Reporter)",
      year: "2023",
      url: "http://censusreporter.org/profiles/16000US1304000-atlanta-ga/",
    },
    {
      category: "faith",
      value: "25%",
      label: "of U.S. adults ages 18–24 attend religious services at least monthly",
      context: "Young adults today are far less likely than previous generations to attend church regularly — a gap ministries in Georgia, where 38% of all adults attend monthly, are working to close.",
      geography: "National, with Georgia context",
      source: "Pew Research Center, Religious Landscape Study",
      year: "2025",
      url: "https://www.pewresearch.org/religion/2025/02/26/decline-of-christianity-in-the-us-has-slowed-may-have-leveled-off/",
    },
    {
      category: "mentalHealth",
      value: "37%",
      label: "of young adults ages 18–25 report significant anxiety symptoms",
      context: "Young adults nationwide face the highest anxiety rates of any age group — underscoring the need for community that walks alongside them.",
      geography: "National",
      source: "CDC, National Health Statistics Report No. 213",
      year: "2024",
      url: "https://www.cdc.gov/nchs/data/nhsr/nhsr213.pdf",
    },
    {
      category: "justice",
      value: "881",
      label: "per 100,000 Georgians are incarcerated",
      context: "Georgia locks up a higher share of its population than almost any other place in the world, leaving many young adults touched by incarceration — their own or a family member's.",
      geography: "Georgia statewide",
      source: "Prison Policy Initiative, \"States of Incarceration: The Global Context\"",
      year: "2024",
      url: "https://www.prisonpolicy.org/profiles/GA.html",
    },
    {
      category: "homelessness",
      value: "2,867",
      label: "people were counted experiencing homelessness in metro Atlanta",
      context: "Homelessness in metro Atlanta has risen for three straight years, with a 7% increase in the most recent count.",
      geography: "Atlanta Continuum of Care (metro Atlanta)",
      source: "Partners for HOME, Point-in-Time Count",
      year: "2024",
      url: "https://partnersforhome.org/state-of-homelessness/",
    },
    {
      category: "loneliness",
      value: "30%",
      label: "of Americans ages 18–34 feel lonely daily or several times a week",
      context: "Nearly a third of young adults nationwide say they experience loneliness multiple times a week — a real need for genuine community.",
      geography: "National",
      source: "American Psychiatric Association poll",
      year: "2024",
      url: "https://www.psychiatry.org/news-room/news-releases/new-apa-poll-one-in-three-americans-feels-lonely-e",
    },
    {
      category: "engagement",
      value: "~6,000",
      label: "weekly attendees at one fast-growing Atlanta congregation, up from under 200 in 2023",
      context: "A wave of young adults — predominantly young Black adults — is packing into at least one fast-growing Atlanta church, real evidence of appetite for faith community in this generation.",
      geography: "Single Atlanta congregation (2819 Church), not citywide",
      source: "AOL News, citing church-reported attendance figures",
      year: "2025",
      url: "https://www.aol.com/articles/why-young-adults-lining-fast-155820780.html",
    },
  ],
  "new-york": [
    {
      category: "youngAdults",
      value: "23.2%",
      label: "of New Yorkers are ages 18–34",
      context: "Nearly one in four New Yorkers is a young adult — the demographic core of any young-adult ministry effort.",
      geography: "New York State (no clean NYC-only figure for this age band was found)",
      source: "New York State Dept. of Labor / Cornell Program on Applied Demographics",
      year: "2025",
      url: "https://dol.ny.gov/system/files/documents/2025/06/young-adults-in-new-york-state-cornell-pad-leslie-reynolds.pdf",
    },
    {
      category: "faith",
      value: "23%",
      label: "of NYC Gen Z now qualify as practicing Christians, up from 10% in 2022",
      context: "Young adults in New York City are returning to faith at a striking rate — more than doubling the share who actively practice Christianity in three years.",
      geography: "New York City",
      source: "Barna Group, \"State of Our City\"",
      year: "2025",
      url: "https://www.for.nyc/state-of-our-city",
    },
    {
      category: "mentalHealth",
      value: "24.4%",
      label: "of NYC adults ages 18–34 reported anxiety or depression symptoms",
      context: "About one in four young adults in New York City is currently living with anxiety or depression — roughly double the rate among New Yorkers 65 and older.",
      geography: "New York City",
      source: "New York Health Foundation, analysis of U.S. Census Household Pulse Survey data",
      year: "2024",
      url: "https://nyhealthfoundation.org/resource/bouncing-back-new-yorkers-mental-health-progress-and-remaining-challenges/",
    },
    {
      category: "justice",
      value: "7,067",
      label: "people held at Rikers Island, the highest since 2019",
      context: "Thousands of New Yorkers — disproportionately young men from the city's poorest neighborhoods — are held at Rikers Island at any given time.",
      geography: "New York City (Rikers Island)",
      source: "NYC Department of Correction data, reported by The City Reporter",
      year: "2025",
      url: "https://www.thecityreporter.nyc/2025/03/20/rikers-population-tops-7000/",
    },
    {
      category: "homelessness",
      value: "21,411",
      label: "single adults in NYC shelters on an average night, up 5% year over year",
      context: "Tens of thousands of New Yorkers, including many young single adults, sleep in city shelters every night, and the number keeps climbing.",
      geography: "New York City",
      source: "NYC Department of Homeless Services, FY25 Data Dashboard",
      year: "2025",
      url: "https://www.nyc.gov/assets/dhs/downloads/pdf/dashboard/FY25-Q4-DHS-Data-Dashboard-Data.pdf",
    },
    {
      category: "loneliness",
      value: "64%",
      label: "of NYC Gen Z report feeling lonely at least monthly",
      context: "Loneliness is a defining struggle for young New Yorkers, with a majority of Gen Z reporting they feel lonely at least once a month.",
      geography: "New York City",
      source: "Barna Group, \"State of Our City\"",
      year: "2025",
      url: "https://www.for.nyc/state-of-our-city",
    },
    {
      category: "engagement",
      value: "2×",
      label: "growth in NYC Gen Z practicing Christians in just three years (10% to 23%)",
      context: "Church engagement among New York City's youngest adults is growing rapidly, not shrinking — a hopeful sign for ministry investment in this city.",
      geography: "New York City",
      source: "Barna Group, \"State of Our City\"",
      year: "2025",
      url: "https://www.for.nyc/state-of-our-city",
    },
  ],
  "los-angeles": [
    {
      category: "youngAdults",
      value: "~20%",
      label: "of LA County residents are ages 15–29",
      context: "Roughly one in five Angelenos is a young adult or approaching young adulthood — one of the largest mission fields in the region.",
      geography: "LA County",
      source: "U.S. Census Bureau, American Community Survey 2019–2023 5-Year Estimates (via Neilsberg Research)",
      year: "2024",
      url: "https://www.neilsberg.com/insights/los-angeles-county-ca-population-by-age/",
    },
    {
      category: "faith",
      value: "27–31%",
      label: "of Americans ages 18–24 say they pray daily",
      context: "Young adults nationally show markedly lower religious engagement than older generations, even as overall Christian identification has begun to stabilize.",
      geography: "National (no LA-specific figure found)",
      source: "Pew Research Center, Religious Landscape Study",
      year: "2025",
      url: "https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/",
    },
    {
      category: "mentalHealth",
      value: "31.7%",
      label: "of California adults reported anxiety or depressive symptoms",
      context: "Roughly one in three California adults — and about half of the youngest adults nationally — are living with real anxiety or depression symptoms right now.",
      geography: "California statewide",
      source: "KFF, analysis of federal health survey data",
      year: "2023",
      url: "https://www.kff.org/mental-health/latest-federal-data-show-that-young-people-are-more-likely-than-older-adults-to-be-experiencing-symptoms-of-anxiety-or-depression/",
    },
    {
      category: "justice",
      value: "~12,738",
      label: "average daily jail population — the largest county jail system in the U.S.",
      context: "Los Angeles County runs the nation's largest jail system, holding well over 12,000 people locally on any given day, many of them young adults cycling through the justice system.",
      geography: "LA County",
      source: "LA County Sheriff's Department, Custody Division Population Quarterly Report",
      year: "2025",
      url: "https://lasd.org/wp-content/uploads/2025/06/Transparency_Custody_Division_Population_2025_First_Quarter_Report.pdf",
    },
    {
      category: "homelessness",
      value: "75,312",
      label: "people counted experiencing homelessness in LA County",
      context: "Tens of thousands of Angelenos are unhoused on any given night — though homelessness among transition-age youth (16–24) fell 16.2% in the latest count, a genuine bright spot.",
      geography: "LA County",
      source: "Los Angeles Homeless Services Authority (LAHSA), Greater LA Homeless Count",
      year: "2024",
      url: "https://www.lahsa.org/news?article=976-2024-greater-los-angeles-homeless-count-data",
    },
    {
      category: "loneliness",
      value: "67%",
      label: "of Gen Z adults (18–26) say they feel lonely — the highest of any generation",
      context: "Two out of every three young adults nationally describe themselves as lonely, more than any other age group, including Baby Boomers at 44%.",
      geography: "National (no LA-specific figure found)",
      source: "The Cigna Group, \"Loneliness in America\" report",
      year: "2025",
      url: "https://filecache.mediaroom.com/mr5mr_thecignagroup/183661/2025-loneliness-in-america-report-the-cigna-group.pdf",
    },
    {
      category: "engagement",
      value: "24%",
      label: "of Americans now volunteer weekly at church, led by Gen Z (21%) and Millennials (19%)",
      context: "Young adults are now volunteering and engaging at church at higher rates than older generations — a genuine bright spot pastors are seeing firsthand.",
      geography: "National, West region (incl. LA) noted as among the fastest-growing",
      source: "Barna Group, \"Are Young Adults Engaging More at Church?\"",
      year: "2025",
      url: "https://www.barna.com/trends/young-adults-church-engagement-pastors/",
    },
  ],
  phoenix: [
    {
      category: "youngAdults",
      value: "~22%",
      label: "of Phoenix's population is age 15–29",
      context: "More than one in five Phoenix residents is a teen or young adult, placing the city among the youngest and fastest-growing major metros in the country.",
      geography: "City of Phoenix",
      source: "U.S. Census Bureau, American Community Survey 2019–2023 5-Year Estimates (via Statistical Atlas)",
      year: "2023",
      url: "https://statisticalatlas.com/place/Arizona/Phoenix/Age-and-Sex",
    },
    {
      category: "faith",
      value: "1.9",
      label: "weekends per month the typical Gen Z churchgoer now attends services",
      context: "Nationally, young adults are now leading a resurgence in church attendance — Gen Z and Millennials out-attending older generations for the first time in decades.",
      geography: "National (no Arizona-specific figure found)",
      source: "Barna Group",
      year: "2024",
      url: "https://www.barna.com/research/young-adults-lead-resurgence-in-church-attendance/",
    },
    {
      category: "mentalHealth",
      value: "21.5%",
      label: "of adults ages 18–24 reported depression symptoms — the highest of any age group",
      context: "Young adults nationwide report the highest rates of anxiety and depression of any age group — a burden many carry silently.",
      geography: "National (no Arizona-specific figure found)",
      source: "CDC, National Health Statistics Report No. 213",
      year: "2024",
      url: "https://www.cdc.gov/nchs/data/nhsr/nhsr213.pdf",
    },
    {
      category: "justice",
      value: "6,727",
      label: "average daily population in the Maricopa County jail system",
      context: "The Maricopa County jail is one of the largest county jail systems in the nation, cycling tens of thousands of people — many of them young adults — through its doors each year.",
      geography: "Maricopa County",
      source: "Maricopa County Correctional Health Services, FY2025 Annual Report",
      year: "2025",
      url: "https://www.maricopa.gov/DocumentCenter/View/113754/CHS-Annual-Report-FY2025",
    },
    {
      category: "homelessness",
      value: "9,734",
      label: "people counted experiencing homelessness — the highest ever recorded",
      context: "Nearly 10,000 people in the Valley of the Sun are without stable housing tonight, the highest number ever recorded here, with unsheltered homelessness up 28% in a single year.",
      geography: "Maricopa County",
      source: "Maricopa Association of Governments, Point-in-Time Count",
      year: "2025",
      url: "https://www.axios.com/local/phoenix/2025/05/29/point-in-time-count-2025-homelessness-increase",
    },
    {
      category: "loneliness",
      value: "79%",
      label: "of Americans ages 18–24 say they feel lonely",
      context: "Young adults are the most digitally connected generation, and yet report feeling the loneliest of any age group.",
      geography: "National (no Arizona-specific figure found)",
      source: "The Cigna Group, \"Loneliness in America\" report",
      year: "2025",
      url: "https://filecache.mediaroom.com/mr5mr_thecignagroup/183661/2025-loneliness-in-america-report-the-cigna-group.pdf",
    },
    {
      category: "engagement",
      value: "59%",
      label: "of new members at one Phoenix church over 15 months were ages 18–30",
      context: "Right here in Phoenix, young adults are leading a wave of church growth at at least one fast-growing local congregation.",
      geography: "Single Phoenix congregation (NPHX Church), not metro-wide",
      source: "Outreach Magazine",
      year: "2025",
      url: "https://outreachmagazine.com/features/discipleship/81300-how-growing-churches-are-reaching-young-adults.html",
    },
  ],
};

export function getCityStats(citySlug: string, categories?: YanStatCategory[]): YanCityStat[] {
  const all = YAN_CITY_STATS[citySlug] ?? [];
  if (!categories) return all;
  return categories
    .map((cat) => all.find((s) => s.category === cat))
    .filter((s): s is YanCityStat => Boolean(s));
}
