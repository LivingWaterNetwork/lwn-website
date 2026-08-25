/**
 * Ministry lanes, in the candidate's priority order.
 *
 * Titles are a weak signal in church hiring — a "Next Steps Pastor" running
 * groups, baptism, assimilation and leader development is often a better fit
 * than a "Young Adults Pastor" who mostly books events. So each lane carries
 * `functionSignals`: the responsibilities that actually identify the work.
 * Classification consults responsibilities first and title second.
 */

export interface MinistryLane {
  key: string;
  label: string;
  /** 1 = highest priority lane. Feeds the ministry-alignment score. */
  priority: number;
  /** Title phrases, lowercased. Matched as substrings against the posting title. */
  titles: string[];
  /** Responsibility phrases that identify this lane regardless of title. */
  functionSignals: string[];
}

export const MINISTRY_LANES: MinistryLane[] = [
  {
    key: "young_adults_pastor",
    label: "Young Adults Pastor",
    priority: 1,
    titles: ["young adults pastor", "young adult pastor", "pastor of young adults"],
    functionSignals: ["young adults", "young adult ministry", "20s and 30s", "twenties and thirties"],
  },
  {
    key: "young_adults_director",
    label: "Young Adults Director",
    priority: 2,
    titles: ["young adults director", "director of young adults", "young adult director"],
    functionSignals: ["young adults", "young adult ministry"],
  },
  {
    key: "college_young_adults_pastor",
    label: "College & Young Adults Pastor",
    priority: 3,
    titles: ["college and young adults", "college & young adults", "college/young adults"],
    functionSignals: ["college ministry", "young adults", "campus ministry"],
  },
  {
    key: "college_pastor",
    label: "College Pastor",
    priority: 4,
    titles: ["college pastor", "college ministry pastor", "pastor of college"],
    functionSignals: ["college students", "university students", "college ministry"],
  },
  {
    key: "discipleship_pastor",
    label: "Discipleship Pastor",
    priority: 5,
    titles: ["discipleship pastor", "pastor of discipleship"],
    functionSignals: ["discipleship pathway", "discipleship strategy", "disciple-making", "discipleship"],
  },
  {
    key: "discipleship_director",
    label: "Discipleship Director",
    priority: 6,
    titles: ["discipleship director", "director of discipleship"],
    functionSignals: ["discipleship pathway", "discipleship strategy", "discipleship"],
  },
  {
    key: "spiritual_formation_pastor",
    label: "Spiritual Formation Pastor",
    priority: 7,
    titles: ["spiritual formation pastor", "formation pastor", "pastor of spiritual formation"],
    functionSignals: ["spiritual formation", "spiritual disciplines", "formation"],
  },
  {
    key: "groups_pastor",
    label: "Groups Pastor",
    priority: 8,
    titles: ["groups pastor", "small groups pastor", "pastor of groups", "small group pastor"],
    functionSignals: ["small groups", "life groups", "group leaders", "group multiplication"],
  },
  {
    key: "community_groups_pastor",
    label: "Community Groups Pastor",
    priority: 9,
    titles: ["community groups pastor", "community group pastor"],
    functionSignals: ["community groups", "missional communities"],
  },
  {
    key: "house_church_pastor",
    label: "House Church Pastor",
    priority: 10,
    titles: ["house church pastor", "microchurch pastor", "micro church pastor"],
    functionSignals: ["house church", "microchurch", "missional community"],
  },
  {
    key: "community_pastor",
    label: "Community Pastor",
    priority: 11,
    titles: ["community pastor", "community life pastor", "pastor of community"],
    functionSignals: ["community life", "belonging", "relational ministry"],
  },
  {
    key: "connections_pastor",
    label: "Connections Pastor",
    priority: 12,
    titles: ["connections pastor", "connection pastor", "pastor of connections"],
    functionSignals: ["guest services", "connection process", "assimilation", "first-time guests"],
  },
  {
    key: "next_steps_pastor",
    label: "Next Steps Pastor",
    priority: 13,
    titles: ["next steps pastor", "pastor of next steps", "next steps director"],
    functionSignals: ["next steps", "baptism", "membership class", "discipleship pathway", "assimilation"],
  },
  {
    key: "engagement_pastor",
    label: "Engagement Pastor",
    priority: 14,
    titles: ["engagement pastor", "pastor of engagement"],
    functionSignals: ["engagement", "volunteer mobilization", "serving teams"],
  },
  {
    key: "assimilation_pastor",
    label: "Assimilation Pastor",
    priority: 15,
    titles: ["assimilation pastor", "pastor of assimilation"],
    functionSignals: ["assimilation", "guest follow-up", "membership pathway"],
  },
  {
    key: "associate_pastor_discipleship",
    label: "Associate Pastor of Discipleship",
    priority: 16,
    titles: ["associate pastor of discipleship", "associate pastor discipleship"],
    functionSignals: ["discipleship", "adult ministries"],
  },
  {
    key: "associate_pastor_community",
    label: "Associate Pastor of Community",
    priority: 17,
    titles: ["associate pastor of community", "associate pastor community", "associate pastor of groups"],
    functionSignals: ["community", "groups", "adult ministries"],
  },
  {
    key: "adult_ministries_pastor",
    label: "Adult Ministries Pastor",
    priority: 18,
    titles: ["adult ministries pastor", "adult ministry pastor", "pastor of adult ministries"],
    functionSignals: ["adult ministries", "adult discipleship"],
  },
  {
    key: "ministries_director",
    label: "Ministries Director",
    priority: 19,
    titles: ["ministries director", "director of ministries", "ministry director"],
    functionSignals: ["ministry oversight", "ministry teams", "staff supervision"],
  },
  {
    key: "campus_pastor",
    label: "Campus Pastor",
    priority: 20,
    titles: ["campus pastor", "site pastor"],
    functionSignals: ["campus leadership", "multisite", "campus team"],
  },
];

export const LANE_BY_KEY = new Map(MINISTRY_LANES.map((l) => [l.key, l]));

export function laneLabel(key: string | null | undefined): string {
  if (!key) return "Unclassified";
  return LANE_BY_KEY.get(key)?.label ?? key;
}

export interface LaneMatch {
  lane: MinistryLane;
  /** 0..1 — how strongly the posting matches this lane. */
  confidence: number;
  matchedOnTitle: boolean;
  signals: string[];
}

/**
 * Classify a posting by title AND responsibilities.
 *
 * A title hit alone is good evidence but not conclusive; responsibility hits
 * raise confidence and can carry a lane on their own. This is why a role with an
 * unfamiliar title still lands in the right lane.
 */
export function classifyLane(title: string, bodyText: string): LaneMatch | null {
  const t = title.toLowerCase();
  const body = `${title}\n${bodyText}`.toLowerCase();

  let best: LaneMatch | null = null;

  for (const lane of MINISTRY_LANES) {
    const matchedOnTitle = lane.titles.some((needle) => t.includes(needle));
    const signals = lane.functionSignals.filter((needle) => body.includes(needle));
    if (!matchedOnTitle && signals.length === 0) continue;

    // Title match is worth 0.6; each responsibility signal adds 0.15, capped at 1.
    const raw = (matchedOnTitle ? 0.6 : 0) + Math.min(signals.length, 3) * 0.15;
    const confidence = Math.min(1, raw);

    // Tie-break toward the higher-priority lane so "College & Young Adults"
    // does not lose to a generic "college" signal elsewhere in the posting.
    const better =
      !best ||
      confidence > best.confidence + 1e-9 ||
      (Math.abs(confidence - best.confidence) < 1e-9 && lane.priority < best.lane.priority);

    if (better) best = { lane, confidence, matchedOnTitle, signals };
  }

  return best;
}
