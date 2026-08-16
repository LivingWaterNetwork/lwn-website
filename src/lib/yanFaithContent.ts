/**
 * Scripture + theologian-quote content anchoring each YAN page in its
 * biblical and historical-Christian grounding. Every entry here must trace
 * to a verified source — a real Bible reference (checked against the actual
 * translation text) and a quote checked against a real book/sermon, not a
 * quote-aggregator site. Never add an entry without that verification.
 *
 * Scripture is quoted from the NIV. Per Biblica's own stated permission,
 * quoting up to ~500 verses (well under any single passage used here) is
 * allowed without further permission provided the "(NIV)" citation appears
 * with the quote and the standard attribution notice appears somewhere on
 * the site (see YanFooter.tsx).
 */

export interface YanFaithScripture {
  reference: string;
  text: string;
}

export interface YanFaithQuote {
  text: string;
  author: string;
  source: string;
}

export interface YanFaithContent {
  scripture: YanFaithScripture;
  quote?: YanFaithQuote;
}

export const YAN_FAITH_CONTENT: Record<string, YanFaithContent> = {
  national: {
    scripture: {
      reference: "John 17:20–23 (NIV)",
      text: "“My prayer is not for them alone. I pray also for those who will believe in me through their message, that all of them may be one, Father, just as you are in me and I am in you. May they also be in us so that the world may believe that you have sent me. … that they may be one as we are one—I in them and you in me—so that they may be brought to complete unity. Then the world will know that you sent me and have loved them even as you have loved me.”",
    },
    quote: {
      text: "Already the new men are dotted here and there all over the earth.",
      author: "C.S. Lewis",
      source: "Mere Christianity (1952), Book 4",
    },
  },
  network: {
    scripture: {
      reference: "1 Corinthians 12:12, 27 (NIV)",
      text: "“Just as a body, though one, has many parts, but all its many parts form one body, so it is with Christ. … Now you are the body of Christ, and each one of you is a part of it.”",
    },
    quote: {
      text: "Christian brotherhood is not an ideal which we must realize; it is rather a reality created by God in Christ in which we may participate.",
      author: "Dietrich Bonhoeffer",
      source: "Life Together (1939)",
    },
  },
  events: {
    scripture: {
      reference: "Hebrews 10:24–25 (NIV)",
      text: "“And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching.”",
    },
    quote: {
      text: "It is by the grace of God that a congregation is permitted to gather visibly in this world to share God's Word and sacrament.",
      author: "Dietrich Bonhoeffer",
      source: "Life Together (1939)",
    },
  },
  leaders: {
    scripture: {
      reference: "1 Peter 5:2–4 (NIV)",
      text: "“Be shepherds of God's flock that is under your care, watching over them—not because you must, but because you are willing, as God wants you to be; not pursuing dishonest gain, but eager to serve; not lording it over those entrusted to you, but being examples to the flock. And when the Chief Shepherd appears, you will receive the crown of glory that will never fade away.”",
    },
    quote: {
      text: "The way of the Christian leader is not the way of upward mobility in which our world has invested so much, but the way of downward mobility ending on the cross.",
      author: "Henri Nouwen",
      source: "In the Name of Jesus: Reflections on Christian Leadership (1989)",
    },
  },
  pray: {
    scripture: {
      reference: "Philippians 4:6–7 (NIV)",
      text: "“Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.”",
    },
    quote: {
      text: "All things else being equal, our prayers are only as powerful as our lives. In the long pull we pray only as well as we live.",
      author: "A.W. Tozer",
      source: "The Root of the Righteous (1955)",
    },
  },
  resources: {
    scripture: {
      reference: "Ephesians 4:11–13 (NIV)",
      text: "“So Christ himself gave the apostles, the prophets, the evangelists, the pastors and teachers, to equip his people for works of service, so that the body of Christ may be built up until we all reach unity in the faith and in the knowledge of the Son of God and become mature, attaining to the whole measure of the fullness of Christ.”",
    },
    quote: {
      text: "Spiritual formation for the Christian … refers to the Spirit-driven process of forming the inner world of the human self in such a way that it becomes like the inner being of Christ himself.",
      author: "Dallas Willard",
      source: "Renovation of the Heart (2002)",
    },
  },
  stories: {
    scripture: {
      reference: "Psalm 107:1–2 (NIV)",
      text: "“Give thanks to the Lord, for he is good; his love endures forever. Let the redeemed of the Lord tell their story—those he redeemed from the hand of the foe.”",
    },
    quote: {
      text: "We must tell people what we have learned here. We must tell them that there is no pit so deep that He is not deeper still. They will listen to us, Corrie, because we have been here.",
      author: "Betsie ten Boom, as recounted by Corrie ten Boom",
      source: "The Hiding Place (1971)",
    },
  },
  join: {
    scripture: {
      reference: "Matthew 28:18–20 (NIV)",
      text: "“Then Jesus came to them and said, ‘All authority in heaven and on earth has been given to me. Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.’”",
    },
    quote: {
      text: "Missions is not the ultimate goal of the church. Worship is.",
      author: "John Piper",
      source: "Let the Nations Be Glad! (1993)",
    },
  },
};

export function getFaithContent(pageKey: string): YanFaithContent | undefined {
  return YAN_FAITH_CONTENT[pageKey];
}
