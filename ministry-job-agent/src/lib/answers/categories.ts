/**
 * Answer bank categories, and the questions applications actually ask in each.
 *
 * The system seeds the QUESTIONS, never the ANSWERS. Every entry starts as DRAFT
 * with an empty approved answer, so the answer bank doubles as the Phase 2
 * worklist: the candidate sees exactly what a church will ask and writes it once.
 */

export interface AnswerCategorySpec {
  key: string;
  label: string;
  description: string;
  /** Representative questions, used both to seed the bank and to match forms. */
  questions: string[];
  keywords: string[];
}

export const ANSWER_CATEGORIES: AnswerCategorySpec[] = [
  {
    key: "pastoral_calling",
    label: "Pastoral Calling",
    description: "How you came to ministry and why you are pursuing pastoral work.",
    questions: [
      "Describe your call to ministry.",
      "Why do you sense God calling you to pastoral ministry?",
      "Tell us about your calling to vocational ministry.",
    ],
    keywords: ["calling", "called", "vocational ministry"],
  },
  {
    key: "testimony",
    label: "Testimony",
    description: "Your personal story of faith.",
    questions: ["Share your personal testimony.", "Tell us your faith journey."],
    keywords: ["testimony", "faith journey"],
  },
  {
    key: "salvation_story",
    label: "Salvation Story",
    description: "How you came to faith in Christ.",
    questions: ["How did you come to faith in Christ?", "Describe your conversion experience."],
    keywords: ["come to faith", "conversion", "born again"],
  },
  {
    key: "ministry_philosophy",
    label: "Ministry Philosophy",
    description: "How you understand and practice ministry.",
    questions: [
      "Describe your ministry philosophy.",
      "What is your approach to ministry?",
      "How do you approach the work of pastoral ministry?",
    ],
    keywords: ["ministry philosophy", "approach to ministry"],
  },
  {
    key: "leadership_philosophy",
    label: "Leadership Philosophy",
    description: "How you lead teams and make decisions.",
    questions: [
      "Describe your leadership style.",
      "What is your philosophy of leadership?",
      "How do you lead a team?",
    ],
    keywords: ["leadership style", "philosophy of leadership", "lead a team"],
  },
  {
    key: "discipleship_philosophy",
    label: "Discipleship Philosophy",
    description: "How you understand and build disciple-making.",
    questions: [
      "Describe your philosophy of discipleship.",
      "How do you make disciples?",
      "What does a healthy discipleship pathway look like to you?",
    ],
    keywords: ["discipleship", "make disciples", "discipleship pathway"],
  },
  {
    key: "young_adult_philosophy",
    label: "Young Adult Ministry Philosophy",
    description: "How you approach ministry with young adults.",
    questions: [
      "What is your philosophy of young adult ministry?",
      "How would you build a young adults ministry?",
      "How do you reach and disciple young adults?",
    ],
    keywords: ["young adult", "young adults ministry"],
  },
  {
    key: "group_philosophy",
    label: "Small Group Philosophy",
    description: "How you build and multiply groups.",
    questions: [
      "What is your philosophy of small groups?",
      "How do you develop and multiply group leaders?",
      "Describe your approach to community groups.",
    ],
    keywords: ["small group", "life group", "community group", "group leaders"],
  },
  {
    key: "conflict_resolution",
    label: "Conflict Resolution",
    description: "How you handle conflict on a team or in a church.",
    questions: [
      "Describe a time you handled conflict in ministry.",
      "How do you approach conflict with a staff member or volunteer?",
    ],
    keywords: ["conflict", "disagreement", "difficult conversation"],
  },
  {
    key: "volunteer_leadership",
    label: "Volunteer Leadership",
    description: "How you recruit, train, and care for volunteers.",
    questions: [
      "How do you recruit and develop volunteers?",
      "Describe your approach to building a volunteer team.",
    ],
    keywords: ["volunteer", "volunteers", "serve team"],
  },
  {
    key: "leadership_development",
    label: "Leadership Development",
    description: "How you identify and grow leaders.",
    questions: [
      "How do you identify and develop leaders?",
      "Describe how you have raised up leaders.",
    ],
    keywords: ["develop leaders", "leadership development", "raise up leaders"],
  },
  {
    key: "teaching_philosophy",
    label: "Teaching Philosophy",
    description: "How you prepare and deliver teaching.",
    questions: [
      "Describe your teaching or preaching philosophy.",
      "How do you prepare a message?",
      "What is your approach to teaching Scripture?",
    ],
    keywords: ["preaching", "teaching", "sermon preparation"],
  },
  {
    key: "church_membership",
    label: "Church Membership",
    description: "Your current church involvement.",
    questions: ["Where do you currently attend church?", "Describe your current church involvement."],
    keywords: ["currently attend", "church membership", "home church"],
  },
  {
    key: "strengths",
    label: "Strengths",
    description: "Your ministry strengths.",
    questions: ["What are your greatest strengths?", "What do you do best in ministry?"],
    keywords: ["strengths", "greatest strength"],
  },
  {
    key: "weaknesses",
    label: "Growth Areas",
    description: "Where you are still growing.",
    questions: ["What are your growth areas?", "What is your greatest weakness?"],
    keywords: ["weakness", "growth area", "areas of growth"],
  },
  {
    key: "relocation",
    label: "Relocation",
    description: "Willingness and constraints around relocating.",
    questions: ["Are you willing to relocate?", "What is your timeline for relocating?"],
    keywords: ["relocate", "relocation", "move"],
  },
  {
    key: "why_this_church",
    label: "Why This Church",
    description: "Church-specific. Never reusable verbatim — always research-driven.",
    questions: ["Why are you interested in our church?", "What draws you to our church?"],
    keywords: ["our church", "why our"],
  },
  {
    key: "why_this_role",
    label: "Why This Role",
    description: "Role-specific interest.",
    questions: ["Why are you interested in this position?", "What draws you to this role?"],
    keywords: ["this position", "this role"],
  },
  {
    key: "salary_expectations",
    label: "Salary Expectations",
    description: "Compensation expectations. The agent never negotiates.",
    questions: ["What are your salary expectations?", "What compensation are you seeking?"],
    keywords: ["salary", "compensation expectations"],
  },
  {
    key: "references",
    label: "References",
    description: "Reference details. The agent never contacts a reference.",
    questions: ["Please list three references.", "Who can speak to your ministry work?"],
    keywords: ["references", "reference"],
  },
  {
    key: "spiritual_disciplines",
    label: "Spiritual Disciplines",
    description: "Your own practices of formation.",
    questions: [
      "Describe your personal spiritual disciplines.",
      "How do you care for your own spiritual life?",
    ],
    keywords: ["spiritual disciplines", "devotional life", "personal walk"],
  },
  {
    key: "family",
    label: "Family",
    description: "Family details, only as the candidate chooses to share them.",
    questions: ["Tell us about your family."],
    keywords: ["your family", "spouse", "children"],
  },
  {
    key: "ministry_experience",
    label: "Ministry Experience",
    description: "Summary of ministry background.",
    questions: [
      "Describe your ministry experience.",
      "Summarize your background in ministry.",
    ],
    keywords: ["ministry experience", "ministry background"],
  },
  {
    key: "leadership_experience",
    label: "Leadership Experience",
    description: "Summary of leadership background.",
    questions: ["Describe your leadership experience.", "What teams have you led?"],
    keywords: ["leadership experience", "teams you have led"],
  },
  {
    key: "organizational_leadership",
    label: "Organizational Leadership",
    description: "Systems, structures, and organizational work.",
    questions: [
      "Describe your experience building ministry systems.",
      "How do you handle organizational and administrative responsibility?",
    ],
    keywords: ["systems", "organizational", "administrative"],
  },
];

export const CATEGORY_BY_KEY = new Map(ANSWER_CATEGORIES.map((c) => [c.key, c]));
