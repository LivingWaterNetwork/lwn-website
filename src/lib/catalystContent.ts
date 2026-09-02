/**
 * Shared Catalyst copy that appears in more than one place — the four capability
 * areas render on both /catalyst and /catalyst/services, and the process stages
 * render on /catalyst and again as context on /catalyst/start. Keeping them here
 * means the two pages can never drift out of sync.
 *
 * Every claim in this file describes work that has actually been done or approved.
 */

export interface CatalystCapability {
  id: string;
  title: string;
  summary: string;
  includes: string[];
}

export const CATALYST_CAPABILITIES: CatalystCapability[] = [
  {
    id: "strategy",
    title: "Strategy & Organizational Architecture",
    summary:
      "Getting clear on what the organization is, how it is structured, and how the parts relate — before deciding what to build.",
    includes: [
      "Clarifying mission, identity, and scope",
      "Mapping programs, initiatives, and how they relate",
      "Organizational structure and documented decision-making",
      "Turning a vision into a sequenced, realistic plan",
      "Defining what should be shared across initiatives and what shouldn't",
    ],
  },
  {
    id: "digital",
    title: "Websites & Digital Experiences",
    summary:
      "Public-facing sites that explain the work clearly and give people a real way to respond.",
    includes: [
      "Website architecture, design, and build",
      "Program and initiative pages",
      "Application, inquiry, and registration funnels",
      "Content systems the team can maintain",
      "Accessibility, responsive layouts, and search fundamentals",
    ],
  },
  {
    id: "operations",
    title: "Operations, AI & Automation",
    summary:
      "The systems behind the site — where information goes, who gets notified, and what stops being done by hand.",
    includes: [
      "Form intake, validation, and data persistence",
      "Connecting submissions to the tools a team already uses",
      "Notification and follow-up routing",
      "Administrative interfaces for managing content without code",
      "Responsible, reviewable use of AI in internal workflows",
    ],
  },
  {
    id: "launch",
    title: "Initiative & Program Launches",
    summary:
      "Standing up a new initiative end to end — name, identity, structure, public presence, and the way people join.",
    includes: [
      "Brand identity and voice for a new initiative",
      "Information architecture built to expand",
      "Public site and participation pathways",
      "Team-facing tools for running it day to day",
      "A structure the next chapter can reuse rather than rebuild",
    ],
  },
];

export interface CatalystStage {
  index: string;
  title: string;
  summary: string;
}

export const CATALYST_PROCESS: CatalystStage[] = [
  {
    index: "01",
    title: "Discover",
    summary:
      "Understand the organization first — the mission, the people, the constraints, and what is actually getting in the way. No solutions yet.",
  },
  {
    index: "02",
    title: "Architect",
    summary:
      "Decide the structure. What gets built, in what order, and how the pieces fit together — so the plan is realistic before anyone writes code.",
  },
  {
    index: "03",
    title: "Build",
    summary:
      "Build it in working increments, reviewing as we go, so the organization sees the real thing early rather than a description of it.",
  },
  {
    index: "04",
    title: "Launch & Strengthen",
    summary:
      "Ship it, hand over what the team needs to run it, and keep improving the parts that carry the most weight.",
  },
];

export const CATALYST_PRINCIPLE = "Technology follows identity, mission, and strategy.";

/** Who the initiative is oriented toward. Descriptive, not a claim of existing clients. */
export const CATALYST_AUDIENCES: { title: string; detail: string }[] = [
  {
    title: "Churches & ministry teams",
    detail: "Congregations and ministry staff who need their work to be findable, joinable, and sustainable.",
  },
  {
    title: "Nonprofits & faith-based organizations",
    detail: "Mission-driven organizations carrying more programs than their current systems can hold.",
  },
  {
    title: "Entrepreneurs & small businesses",
    detail: "Owners building something real who need structure to grow without breaking what works.",
  },
  {
    title: "Community initiatives",
    detail: "Efforts that started informally and now need an actual foundation underneath them.",
  },
  {
    title: "Mission-driven leaders",
    detail: "Leaders with a clear conviction and no clear path from that conviction to implementation.",
  },
];

/** The three-layer operating-system architecture. Vision and structure only. */
export const CATALYST_OS_LAYERS: { name: string; summary: string }[] = [
  {
    name: "Neutral Core",
    summary:
      "The shared foundations that shouldn't be rebuilt for every initiative — common conventions for handling information, validating it, storing it, notifying people, and presenting it consistently.",
  },
  {
    name: "Organization Layer",
    summary:
      "What makes a given organization itself: its identity, mission language, structure, and the decisions that shouldn't drift as it grows.",
  },
  {
    name: "Deployment Layer",
    summary:
      "Where a specific site, program, or initiative actually ships — drawing on both layers beneath it instead of starting from nothing.",
  },
];

export const CATALYST_RELATIONSHIP_LINE =
  "Living Water Catalyst is an innovation and growth initiative being developed within the Living Water Network ecosystem.";
