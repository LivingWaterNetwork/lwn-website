// Capability copy, verbatim from 02-WEBSITE-COPY.md (Home overview cards and the
// Capabilities page). Order is fixed — the four run in sequence on every
// engagement (01-BRAND-FOUNDATION.md §10).
import type { CapabilityName } from "./types";

export interface Capability {
  name: CapabilityName;
  slugId: string;
  /** One-line summary used on the home page cards. */
  summary: string;
  tagline: string;
  /** Full body used on /capabilities. */
  body: string;
}

export const capabilities: Capability[] = [
  {
    name: "Strategy & Organizational Architecture",
    slugId: "strategy-and-organizational-architecture",
    summary:
      "Mission clarity, operating models, and the decisions that have to come before anything gets built.",
    tagline: "Clarity before construction.",
    body: "Before anything is designed or built, we help you get clear on what actually matters — the mission, the operating model, the governance and decision structures, and the priorities that should drive everything after this. This work can include mission and strategic clarification, program architecture, operating models, governance and decision structures, prioritization, implementation roadmaps, and organizational alignment.",
  },
  {
    name: "Websites & Digital Platforms",
    slugId: "websites-and-digital-platforms",
    summary:
      "Modern, connected digital experiences built on a real understanding of who they serve.",
    tagline: "The room, resolved — for your digital presence.",
    body: "We design and build modern websites, program hubs, directories, intake experiences, landing pages, content systems, and connected user journeys — grounded in the strategy work that comes first, not built ahead of it. This can include modern websites, program hubs, directories, intake experiences, landing pages, content systems, digital ecosystems, responsive development, and connected user journeys.",
  },
  {
    name: "Operations, AI & Automation",
    slugId: "operations-ai-and-automation",
    summary:
      "Workflow, knowledge, and automation systems built with human approval at every consequential step.",
    tagline: "Responsible automation, human-approved.",
    body: "We help organizations design workflows, knowledge systems, and automation that hold up over time — with clear boundaries around data and knowledge, and a human in the loop wherever a decision actually matters. This can include workflow design, knowledge systems, responsible AI foundations, human-approval processes, automation strategy, organizational continuity, data and knowledge boundaries, and agent and tool architecture.",
  },
  {
    name: "Initiatives & Program Launches",
    slugId: "initiatives-and-program-launches",
    summary:
      "Turning an idea into a structured program with a real launch plan behind it.",
    tagline: "From idea to structured program.",
    body: "Some engagements start with an idea that hasn't taken shape yet. We help turn that idea into a structured program with real communication systems, operational preparation, and a launch plan with clear next steps and measurements — including brand and initiative development.",
  },
];
