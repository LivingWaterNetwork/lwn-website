/**
 * City hub registry for the YAN national network. Adding a new city means
 * adding one entry here plus its page at src/app/yan/[city-slug]/page.tsx —
 * the city selector, nav switcher, and cross-city callouts are all driven
 * off this list.
 */
export type YanCityStatus = "live" | "launching-soon";

export interface YanCity {
  slug: string;
  name: string;
  shortName: string;
  state: string;
  status: YanCityStatus;
  isFoundingHub?: boolean;
  /** Short badge shown on cards/selectors — earned-through-story, not org-chart language. */
  stageBadge: string;
  tagline: string;
  summary: string;
  heroImage: string;
  heroImageAlt: string;
}

export const YAN_CITIES: YanCity[] = [
  {
    slug: "atlanta",
    name: "Atlanta",
    shortName: "ATL",
    state: "Georgia",
    status: "live",
    isFoundingHub: true,
    stageBadge: "Founding Hub",
    tagline: "One City. Many Churches. One Mission.",
    summary: "Where YAN began — a growing network of young-adult ministries across metro Atlanta.",
    heroImage: "/images/yan/source/atlanta-skyline-dusk.jpg",
    heroImageAlt: "Downtown Atlanta skyline at dusk",
  },
  {
    slug: "new-york",
    name: "New York City",
    shortName: "NYC",
    state: "New York",
    status: "launching-soon",
    stageBadge: "New Hub — Join the Launch Team",
    tagline: "One City. Many Churches. One Mission.",
    summary: "The same movement, taking root in the five boroughs.",
    heroImage: "/images/yan/source/nyc-aerial-skyline.jpg",
    heroImageAlt: "Aerial view of the New York City skyline",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    shortName: "LA",
    state: "California",
    status: "launching-soon",
    stageBadge: "New Hub — Join the Launch Team",
    tagline: "One City. Many Churches. One Mission.",
    summary: "The same movement, taking root across Los Angeles.",
    heroImage: "/images/yan/source/la-downtown-skyline.jpg",
    heroImageAlt: "Downtown Los Angeles skyline",
  },
  {
    slug: "phoenix",
    name: "Phoenix",
    shortName: "PHX",
    state: "Arizona",
    status: "launching-soon",
    stageBadge: "New Hub — Join the Launch Team",
    tagline: "One City. Many Churches. One Mission.",
    summary: "The same movement, taking root across Phoenix and the Valley.",
    heroImage: "/images/yan/source/young-adults-hangout-music.jpg",
    heroImageAlt: "Young adults gathering together",
  },
];

export function getYanCity(slug: string): YanCity | undefined {
  return YAN_CITIES.find((c) => c.slug === slug);
}

export function getHomeBaseCity(): YanCity {
  return YAN_CITIES.find((c) => c.isFoundingHub) ?? YAN_CITIES[0];
}

export function getOtherCities(slug: string): YanCity[] {
  return YAN_CITIES.filter((c) => c.slug !== slug);
}
