/**
 * Ministry portfolio registry and per-role selection.
 *
 * Summaries here describe what each body of work IS. They deliberately contain
 * no scale claims — no participant counts, budgets, church counts, reach, or
 * financial or tax status. Those are candidate facts and live in the candidate
 * database only once approved.
 *
 * Full curricula are never auto-attached. Applications get a summary, and a link
 * or excerpt only where the candidate has supplied one.
 */

export interface PortfolioAssetSpec {
  key: string;
  name: string;
  summary: string;
  detail: string;
  /** Lanes this asset speaks to most directly. */
  bestFor: string[];
  directory: string;
}

export const PORTFOLIO_ASSETS: PortfolioAssetSpec[] = [
  {
    key: "living-water-network",
    name: "Living Water Network",
    summary:
      "The ministry organization I founded, which began as Living Hydatos Ministries Inc. and later changed its legal name to Living Water Network Inc.",
    detail:
      "Supports a ministry narrative around spiritual formation, discipleship, leadership development, ministry and marketplace leaders, young-adult ministry, community, equipping leaders, and holistic formation. Organizational scale, staffing, budget, reach, and tax status are NOT PROVIDED and must never be inferred.",
    bestFor: [
      "discipleship_pastor",
      "discipleship_director",
      "spiritual_formation_pastor",
      "ministries_director",
      "associate_pastor_discipleship",
    ],
    directory: "portfolio/living-water-network",
  },
  {
    key: "at-the-table",
    name: "At the Table",
    summary:
      "A spiritual and emotional formation framework for Kingdom leaders, built around formation across spiritual, mental, emotional, physical, relational health and stewardship.",
    detail:
      "In an application this demonstrates a developed formation philosophy, theological reflection, discipleship design, leadership development, curriculum creation, and pastoral formation thinking. Send the portfolio summary — never the full curriculum by default.",
    bestFor: [
      "discipleship_pastor",
      "discipleship_director",
      "spiritual_formation_pastor",
      "associate_pastor_discipleship",
      "adult_ministries_pastor",
    ],
    directory: "portfolio/at-the-table",
  },
  {
    key: "yan",
    name: "Young Adults Network (YAN)",
    summary:
      "A network posture for young-adult ministry: Connect, Collaborate, Pray, Impact — bringing existing young-adult ministries and leaders together rather than creating another isolated program.",
    detail:
      "Evidence of young-adult ministry strategy, collaboration, networking churches, leadership development, and community-building that supports rather than competes with the local church.",
    bestFor: [
      "young_adults_pastor",
      "young_adults_director",
      "college_young_adults_pastor",
      "college_pastor",
      "connections_pastor",
      "community_pastor",
    ],
    directory: "portfolio/yan",
  },
  {
    key: "gather",
    name: "GATHER",
    summary:
      "A young-adult discipleship and community curriculum working through Titus, built on the movement from 'Hey Stranger' to 'Hey Neighbor'.",
    detail:
      "Demonstrates relational discipleship, conversation-driven formation, Scripture engagement, community, small-group interaction, relational sending, belonging, and leadership development.",
    bestFor: [
      "young_adults_pastor",
      "young_adults_director",
      "groups_pastor",
      "community_groups_pastor",
      "house_church_pastor",
      "college_young_adults_pastor",
    ],
    directory: "portfolio/gather",
  },
  {
    key: "teaching",
    name: "Teaching Samples",
    summary: "Teaching material and samples. NOT PROVIDED until the candidate supplies links or files.",
    detail: "Populate portfolio/teaching and record the links as approved candidate facts before use.",
    bestFor: [],
    directory: "portfolio/teaching",
  },
  {
    key: "preaching",
    name: "Preaching Samples",
    summary: "Preaching links and samples. NOT PROVIDED until the candidate supplies links or files.",
    detail: "Populate portfolio/preaching and record the links as approved candidate facts before use.",
    bestFor: [],
    directory: "portfolio/preaching",
  },
];

export const ASSET_BY_KEY = new Map(PORTFOLIO_ASSETS.map((a) => [a.key, a]));

export interface PortfolioSelection {
  key: string;
  name: string;
  reason: string;
}

/**
 * Pick the two or three assets that actually support this role.
 * Deliberately capped: an application buried in attachments reads as a
 * mass mailing, which is the opposite of what this system is for.
 */
export function selectPortfolio(lane: string | null, bodyText: string): PortfolioSelection[] {
  const body = bodyText.toLowerCase();
  const picks: PortfolioSelection[] = [];

  if (lane) {
    for (const asset of PORTFOLIO_ASSETS) {
      if (asset.bestFor.includes(lane)) {
        picks.push({
          key: asset.key,
          name: asset.name,
          reason: `Directly supports the ${lane.replace(/_/g, " ")} lane.`,
        });
      }
    }
  }

  // Keyword rescue for roles whose lane did not classify.
  if (picks.length === 0) {
    if (/young adult|college|campus ministry/.test(body)) {
      pushUnique(picks, "yan", "Posting centers on young adults or college ministry.");
      pushUnique(picks, "gather", "Young-adult discipleship curriculum is directly relevant.");
    }
    if (/discipleship|formation|spiritual growth/.test(body)) {
      pushUnique(picks, "at-the-table", "Posting emphasizes discipleship or spiritual formation.");
      pushUnique(picks, "living-water-network", "Organizational and formation leadership context.");
    }
    if (/small group|life group|community group|house church/.test(body)) {
      pushUnique(picks, "gather", "Group-based relational discipleship curriculum.");
    }
  }

  if (picks.length === 0) {
    pushUnique(picks, "living-water-network", "Default organizational and leadership context.");
  }

  return picks.slice(0, 3);
}

function pushUnique(list: PortfolioSelection[], key: string, reason: string) {
  if (list.some((p) => p.key === key)) return;
  const asset = ASSET_BY_KEY.get(key);
  if (!asset) return;
  list.push({ key: asset.key, name: asset.name, reason });
}
