/**
 * The theology topic registry.
 *
 * These are the topics the system knows an application might ask about. Every
 * one of them starts as NOT_YET_DEFINED. The system never populates a position:
 * only the candidate can, through the review queue.
 */

export interface TheologyTopic {
  topic: string;
  displayName: string;
  /** Words in a question that indicate it is asking about this topic. */
  triggers: string[];
}

export const THEOLOGY_TOPICS: TheologyTopic[] = [
  { topic: "scripture", displayName: "Scripture", triggers: ["scripture", "bible", "inerran", "infallib", "authority of the word"] },
  { topic: "trinity", displayName: "The Trinity", triggers: ["trinity", "triune", "godhead"] },
  { topic: "jesus_christ", displayName: "Jesus Christ", triggers: ["jesus", "christ", "incarnation", "deity of christ", "resurrection"] },
  { topic: "salvation", displayName: "Salvation", triggers: ["salvation", "saved", "justification", "atonement", "born again"] },
  { topic: "holy_spirit", displayName: "The Holy Spirit", triggers: ["holy spirit", "pneumatology", "filled with the spirit"] },
  { topic: "church", displayName: "The Church", triggers: ["the church", "local church", "body of christ"] },
  { topic: "gospel", displayName: "The Gospel", triggers: ["gospel", "good news", "evangel"] },
  { topic: "baptism", displayName: "Baptism", triggers: ["baptism", "baptize", "immersion"] },
  { topic: "communion", displayName: "Communion / Lord's Supper", triggers: ["communion", "lords supper", "eucharist", "table"] },
  { topic: "spiritual_gifts", displayName: "Spiritual Gifts", triggers: ["spiritual gifts", "gifts of the spirit", "tongues", "prophecy"] },
  { topic: "charismatic_theology", displayName: "Charismatic Theology", triggers: ["charismatic", "continuationist", "cessationist", "pentecostal"] },
  { topic: "women_in_ministry", displayName: "Women in Ministry", triggers: ["women in ministry", "female pastor", "women preach", "women elders"] },
  { topic: "complementarian_egalitarian", displayName: "Complementarianism / Egalitarianism", triggers: ["complementarian", "egalitarian", "gender roles"] },
  { topic: "marriage", displayName: "Marriage", triggers: ["marriage", "divorce", "remarriage"] },
  { topic: "sexuality", displayName: "Human Sexuality", triggers: ["sexuality", "human sexuality", "lgbt", "same-sex", "gender identity"] },
  { topic: "sanctification", displayName: "Sanctification", triggers: ["sanctification", "holiness", "spiritual growth doctrine"] },
  { topic: "creation", displayName: "Creation", triggers: ["creation", "genesis", "young earth", "evolution"] },
  { topic: "eschatology", displayName: "Eschatology", triggers: ["eschatolog", "end times", "second coming", "millennium", "rapture"] },
  { topic: "calvinism_arminianism", displayName: "Calvinism / Arminianism", triggers: ["calvinis", "arminian", "doctrines of grace", "free will"] },
  { topic: "election", displayName: "Election & Predestination", triggers: ["election", "predestination", "foreknowledge"] },
  { topic: "church_governance", displayName: "Church Governance", triggers: ["governance", "polity", "elder-led", "congregational", "episcopal"] },
  { topic: "ecclesiology", displayName: "Ecclesiology", triggers: ["ecclesiolog", "nature of the church", "marks of the church"] },
  { topic: "missions", displayName: "Missions", triggers: ["missions", "missionary", "great commission", "global outreach"] },
  { topic: "discipleship", displayName: "Discipleship (theological)", triggers: ["theology of discipleship", "disciple-making theology"] },
  { topic: "spiritual_formation", displayName: "Spiritual Formation (theological)", triggers: ["theology of formation", "spiritual formation theology"] },
];

export const TOPIC_BY_KEY = new Map(THEOLOGY_TOPICS.map((t) => [t.topic, t]));

/**
 * Decide whether a question is substantively theological.
 *
 * Requires a trigger phrase AND doctrinal framing ("what do you believe",
 * "your position on", "do you affirm"). "Describe your discipleship philosophy"
 * is a ministry-philosophy question and belongs to the answer bank; "what is
 * your position on baptism" is doctrinal and must route to theological review.
 */
export function detectTheologyTopics(question: string): TheologyTopic[] {
  const q = question.toLowerCase();
  const doctrinalFraming =
    /\b(believe|belief|doctrine|doctrinal|position on|view on|views on|stance|affirm|conviction|theolog|statement of faith|where do you stand)\b/.test(
      q,
    );
  if (!doctrinalFraming) return [];
  return THEOLOGY_TOPICS.filter((t) => t.triggers.some((trigger) => q.includes(trigger)));
}
