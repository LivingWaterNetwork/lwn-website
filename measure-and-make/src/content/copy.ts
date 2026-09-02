// Page copy, verbatim from 02-WEBSITE-COPY.md. Placeholders in that file stay
// placeholders here — they are not filled in with invented text.

export const home = {
  eyebrow: "MEASURE & MAKE",
  headline: "From scattered ideas to durable form.",
  supporting:
    "We help mission-driven organizations turn consequential vision into clear strategy, connected systems, digital platforms, and responsible technology.",
  why: {
    eyebrow: "WHY MEASURE & MAKE",
    headline: "Clarity before construction.",
    body: "Most organizations don't need more technology. They need to be understood first — the mission, the people, the systems already in place, and the gap between where things stand and where they need to go. Measure & Make starts by listening. What we build afterward is shaped by what we actually find, not by a template.",
  },
  capabilities: {
    eyebrow: "WHAT WE DO",
    headline: "Four capabilities, one continuous process.",
  },
  process: {
    eyebrow: "HOW WE WORK",
    intro: "Every engagement moves through the same four stages, in order:",
  },
  // The home page's featured-work section reuses the approved Work-page eyebrow,
  // headline, and empty state rather than introducing new copy for it.
  featuredWork: {
    eyebrow: "OUR WORK",
    headline: "Work built on understanding, not templates.",
  },
  closing: {
    headline: "Let's clarify what's next.",
    body: "If your organization has a mission that's outrunning its infrastructure, we'd like to hear where things stand.",
  },
} as const;

export const work = {
  eyebrow: "OUR WORK",
  headline: "Work built on understanding, not templates.",
  intro:
    "Every project below started the same way — by listening first. What follows is what we've verified, built, and shipped; where something is still in progress, we say so.",
  emptyState:
    "We're building our public portfolio carefully — every case study here is verified before it's published. Check back soon, or start a conversation about your own project.",
  detailLabels: {
    challenge: "The Challenge",
    approach: "Our Approach",
    workCompleted: "What We Built",
    currentStage: "Where It Stands",
    verifiedOutcomes: "Verified Outcomes",
  },
} as const;

export const capabilitiesPage = {
  eyebrow: "WHAT WE DO",
  headline: "Four capabilities, one continuous process.",
  intro:
    "Measure & Make isn't a web shop, a marketing agency, or an AI vendor. These four capabilities work together, in the order below, on every engagement.",
} as const;

export const processPage = {
  eyebrow: "HOW WE WORK",
  headline: "Technology follows identity, mission, and strategy.",
} as const;

export const about = {
  eyebrow: "ABOUT MEASURE & MAKE",
  /**
   * 02-WEBSITE-COPY.md carries a bracketed placeholder here and
   * 08-OPEN-DECISIONS.md #2 says not to draft a founder narrative on the
   * founder's behalf. Both placeholders below render as visible pending notes.
   */
  headlinePending:
    "Founder-voice headline pending founder input — no personal narrative has been written on the founder's behalf.",
  brandMeaningBody:
    "Measure & Make exists at the intersection of discernment and execution. Measure represents listening, discernment, research, evidence, clarity, strategy, architecture, and responsible stewardship — understanding an organization before prescribing technology. Make represents execution, craftsmanship, implementation, digital products, operational systems, programs, responsible automation, and durable organizational infrastructure. The brass center of our mark is accountable action: the point where measured understanding becomes a clear decision and durable form.",
  companyStagePending:
    "An honest description of the company's current stage, team size, and experience level is pending founder confirmation. No years-of-experience, team-size, or scale language will appear here until it is.",
} as const;

export const contact = {
  eyebrow: "START A CONVERSATION",
  headline: "Let's find out what your organization actually needs.",
  body: "Tell us a little about where things stand. We'll follow up to schedule a conversation.",
  submitLabel: "Send",
  sendingLabel: "Just a moment.",
  successHeadline:
    "Thank you \u2014 we\u2019ve received your message and will follow up soon.",
  successBody:
    "Your details are saved and our inbox has been notified. If anything is missing, we\u2019ll ask when we reply.",
  validationError: "Please check the highlighted fields and try again.",
  rateLimitedError:
    "That\u2019s several messages from this connection in a short window, so this one wasn\u2019t sent. Please try again in a few minutes.",
  submissionError:
    "Something went wrong on our end, so your message wasn\u2019t sent and nothing was saved. Please try again in a few minutes.",
  notConfiguredError:
    "This form isn\u2019t connected to its inbox in this environment yet, so your message wasn\u2019t sent and nothing was saved. Please try again later.",
} as const;

export const notFound = {
  headline: "This page didn't make it through.",
  body: "The page you're looking for isn't here. It may have moved, or the link may be out of date.",
  cta: "Return Home",
} as const;
