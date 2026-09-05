// The four-stage process, verbatim from 02-WEBSITE-COPY.md (Process page) with
// the shorter home-page phrasing of each stage kept alongside it.

export interface ProcessStage {
  number: number;
  name: string;
  /** Short form used on the home page. */
  summary: string;
  /** Full form used on /services. */
  body: string;
}

export const PROCESS_PRINCIPLE =
  "Technology follows identity, mission, and strategy.";

export const PROCESS_CLOSING_LINE = "Clarity is an act of stewardship.";

export const processStages: ProcessStage[] = [
  {
    number: 1,
    name: "Listen & Measure",
    summary:
      "Understand the mission, people, environment, evidence, problems, opportunities, and existing systems.",
    body: "We start by understanding — the mission, the people involved, the environment you're operating in, the evidence already available, the problems and opportunities on the table, and whatever systems already exist. Nothing gets designed before this stage is done.",
  },
  {
    number: 2,
    name: "Clarify & Architect",
    summary:
      "Define the decisions, requirements, structure, priorities, boundaries, and implementation path.",
    body: "With a real understanding in hand, we help you define the decisions that have to be made, the requirements that follow from them, the structure and priorities, the boundaries, and a concrete implementation path.",
  },
  {
    number: 3,
    name: "Design & Make",
    summary:
      "Build the digital experience, operating system, program, workflow, documentation, or approved technology.",
    body: "This is where the digital experience, operating system, program, workflow, documentation, or approved technology actually gets built — shaped by everything the first two stages surfaced.",
  },
  {
    number: 4,
    name: "Launch & Strengthen",
    summary: "Test, release, document, train, measure, support, and improve.",
    body: "We test, release, document, train, measure, support, and improve — launch is a stage in the process, not the end of the relationship.",
  },
];
