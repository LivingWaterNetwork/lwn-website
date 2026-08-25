/**
 * Resume variant registry and selection.
 *
 * The system never writes resume content. Each variant points at a file the
 * candidate supplies under ./resumes; until that file exists the variant is
 * NOT_PROVIDED and any package selecting it is blocked from approval.
 * Tailoring reorders and re-emphasizes approved material — nothing more.
 */

export interface ResumeVariantSpec {
  key: string;
  name: string;
  focus: string;
  /** Lanes this variant is the natural fit for. */
  lanes: string[];
  sourcePath: string;
  atsPath: string;
}

export const RESUME_VARIANTS: ResumeVariantSpec[] = [
  {
    key: "young-adults",
    name: "Young Adults",
    focus: "Young adult and college ministry leadership, community, discipleship of 20s–30s.",
    lanes: ["young_adults_pastor", "young_adults_director", "college_young_adults_pastor", "college_pastor"],
    sourcePath: "resumes/young-adults/resume.md",
    atsPath: "resumes/young-adults/resume-ats.txt",
  },
  {
    key: "discipleship",
    name: "Discipleship",
    focus: "Discipleship pathways, spiritual formation, curriculum design, leader formation.",
    lanes: ["discipleship_pastor", "discipleship_director", "spiritual_formation_pastor", "associate_pastor_discipleship"],
    sourcePath: "resumes/discipleship/resume.md",
    atsPath: "resumes/discipleship/resume-ats.txt",
  },
  {
    key: "groups-community",
    name: "Groups / Community",
    focus: "Small groups systems, group leader development, relational community structures.",
    lanes: ["groups_pastor", "community_groups_pastor", "house_church_pastor", "community_pastor", "associate_pastor_community"],
    sourcePath: "resumes/groups-community/resume.md",
    atsPath: "resumes/groups-community/resume-ats.txt",
  },
  {
    key: "connections-next-steps",
    name: "Connections / Next Steps",
    focus: "Assimilation, guest pathways, next-steps systems, volunteer mobilization.",
    lanes: ["connections_pastor", "next_steps_pastor", "engagement_pastor", "assimilation_pastor"],
    sourcePath: "resumes/connections-next-steps/resume.md",
    atsPath: "resumes/connections-next-steps/resume-ats.txt",
  },
  {
    key: "associate-pastor",
    name: "Associate Pastor",
    focus: "Broad pastoral leadership, teaching, staff and volunteer oversight, pastoral care.",
    lanes: ["associate_pastor_discipleship", "associate_pastor_community", "ministries_director"],
    sourcePath: "resumes/associate-pastor/resume.md",
    atsPath: "resumes/associate-pastor/resume-ats.txt",
  },
  {
    key: "campus-adult-ministry",
    name: "Campus / Adult Ministries",
    focus: "Campus leadership, adult ministries oversight, multisite team leadership.",
    lanes: ["campus_pastor", "adult_ministries_pastor", "ministries_director"],
    sourcePath: "resumes/campus-adult-ministry/resume.md",
    atsPath: "resumes/campus-adult-ministry/resume-ats.txt",
  },
];

export const MASTER_RESUME_PATH = "resumes/master/resume.md";

export interface VariantSelection {
  key: string;
  name: string;
  rationale: string;
  /** Runners-up, so the candidate can override with one click. */
  alternatives: Array<{ key: string; name: string; reason: string }>;
}

/** Choose a resume variant from the lane, falling back to posting keywords. */
export function selectResumeVariant(
  lane: string | null,
  bodyText: string,
): VariantSelection {
  if (lane) {
    const direct = RESUME_VARIANTS.filter((v) => v.lanes.includes(lane));
    if (direct.length > 0) {
      const chosen = direct[0]!;
      return {
        key: chosen.key,
        name: chosen.name,
        rationale: `Role classified in the ${lane.replace(/_/g, " ")} lane, which this variant targets directly.`,
        alternatives: direct.slice(1).concat(RESUME_VARIANTS.filter((v) => !direct.includes(v)))
          .slice(0, 2)
          .map((v) => ({ key: v.key, name: v.name, reason: v.focus })),
      };
    }
  }

  // No lane: score variants by how much of their focus vocabulary the posting uses.
  const body = bodyText.toLowerCase();
  const scored = RESUME_VARIANTS.map((v) => {
    const terms = v.focus
      .toLowerCase()
      .split(/[,.]/)
      .flatMap((s) => s.trim().split(" "))
      .filter((t) => t.length > 4);
    const hits = new Set(terms.filter((t) => body.includes(t)));
    return { variant: v, hits: hits.size };
  }).sort((a, b) => b.hits - a.hits);

  const top = scored[0]!;
  if (top.hits === 0) {
    return {
      key: "associate-pastor",
      name: "Associate Pastor",
      rationale:
        "No ministry lane matched and the posting used none of the variant focus vocabulary. Defaulting to the broadest pastoral variant — review before use.",
      alternatives: RESUME_VARIANTS.slice(0, 2).map((v) => ({ key: v.key, name: v.name, reason: v.focus })),
    };
  }

  return {
    key: top.variant.key,
    name: top.variant.name,
    rationale: `Selected on posting vocabulary overlap (${top.hits} focus terms present); no ministry lane matched.`,
    alternatives: scored.slice(1, 3).map((s) => ({
      key: s.variant.key,
      name: s.variant.name,
      reason: s.variant.focus,
    })),
  };
}
