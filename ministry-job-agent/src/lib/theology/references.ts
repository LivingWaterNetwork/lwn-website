/**
 * Reference statements of faith.
 *
 * These are OTHER ORGANIZATIONS' published doctrinal statements, quoted verbatim
 * with attribution. They exist for one purpose: to give the candidate something
 * concrete to react to when defining his own positions, instead of a blank page.
 *
 * They are NOT the candidate's theology and must never be treated as such. No
 * code reads this file when answering an application question — the resolver
 * only ever reads APPROVED TheologyPosition rows. A reference becomes the
 * candidate's position only when he adopts it himself, and the adoption records
 * which source he drew from.
 *
 * Sources fetched 2026-08-25. Verify against the live pages before relying on
 * any of it in an interview; churches revise these.
 */

export interface ReferenceArticle {
  /** Heading as published. */
  heading: string;
  /** Verbatim text. Never paraphrased — the candidate is reacting to real wording. */
  text: string;
  /** Topic keys from THEOLOGY_TOPICS this article speaks to. */
  topics: string[];
}

export interface ReferenceStatement {
  key: string;
  organization: string;
  location: string;
  url: string;
  /** Why the candidate named this source. */
  note: string;
  fetchedAt: string;
  articles: ReferenceArticle[];
}

export const REFERENCE_STATEMENTS: ReferenceStatement[] = [
  {
    key: "change-church",
    organization: "Change Church",
    location: "Atlanta, GA",
    url: "https://lifechange.org/our-beliefs/",
    note: "Named by the candidate as aligning with his theology.",
    fetchedAt: "2026-08-25",
    articles: [
      {
        heading: "God",
        text: "We believe God exists eternally and equally in three persons: the Father, Son, and Holy Spirit. (Matthew 28:19; Colossians 2:9)",
        topics: ["trinity"],
      },
      {
        heading: "Jesus",
        text: "Jesus Christ is the Son of God. He is equal with the Father. Jesus lived a sinless human life and offered Himself as the perfect sacrifice for the sins of all people by dying on the cross. He rose from the dead on the third day to demonstrate His power over sin and death. He ascended into heaven and will return to earth to reign as King. (Matthew 1:22-23; Romans 1:3-4; 1 Corinthians 15:3-4; Hebrews 4:14-15)",
        topics: ["jesus_christ", "eschatology"],
      },
      {
        heading: "The Holy Spirit",
        text: "The Holy Spirit is the third person of the Trinity. He was constantly spoken of and promised by Jesus. He lives in every Christian from the moment of authentic conversion to indwell, infill, enlighten, empower, lead, guide, correct, convict, and comfort their lives. (John 14:16-18; Ephesians 5:18; Romans 8:15; Acts 1:8)",
        topics: ["holy_spirit"],
      },
      {
        heading: "The Bible",
        text: "We believe what the Bible says about itself which is that it is inspired by God. It is a collection of writings by human authors who were under the authority and guidance of the Holy Spirit. It is to be interpreted according to its context and purpose and when “rightly divided” it is the ultimate authority for our faith, our lives, and the practices of our church. (Matthew 22:29; 2 Timothy 3:15-16; Romans 15:4)",
        topics: ["scripture"],
      },
      {
        heading: "Salvation",
        text: "Salvation is God's free gift to humanity but as is the case with any gift, it must be received. The way we receive this gift is only by trusting in the death, burial, resurrection, and ascension of Jesus Christ. (1 Timothy 2:5; Romans 10:9)",
        topics: ["salvation", "gospel"],
      },
      {
        heading: "Generosity",
        text: "We believe that tithes, offerings, and alms are God's financial plan for the support of His work. (Malachi 3:10; Matthew 23:23; 2 Corinthians 9:6-12)",
        topics: [],
      },
      {
        heading: "Discipline",
        text: "We believe that discipline is a gift from Christ given to His church to promote its health and productivity. (Matthew 18:15-20; Proverbs 19:18)",
        topics: ["church"],
      },
    ],
  },
  {
    key: "2819-church",
    organization: "2819 Church",
    location: "Atlanta, GA",
    url: "https://www.2819church.org/our-beliefs",
    note: "Named by the candidate as aligning with his theology. Self-describes as “a champion for grace and truth while maintaining a conservative theological position.”",
    fetchedAt: "2026-08-25",
    articles: [
      {
        heading: "01 — God",
        text: "There is one God, who eternally exists in three persons: The Father, The Son and The Holy Spirit. These three persons are co-equal, co-eternal, and distinct from one another, yet unified. (1 John 5:7; Genesis 1:26; Matthew 3:16-17; Matthew 28:19; Luke 1:35; Isaiah 9:6; Hebrews 3:7-11)",
        topics: ["trinity"],
      },
      {
        heading: "02 — Jesus",
        text: "Jesus Christ is God the Son, the second person of the Trinity. During his earthly ministry he possessed both complete divinity and complete humanity. He alone lived without sin, was born of a virgin, performed miracles, died for humanity's redemption through blood sacrifice, and rose three days later. He ascended to God's right hand and will return in majesty. (John 1:1, 1:14, 20:28; 1 Timothy 3:16; Isaiah 9:6; Philippians 2:5-6; 1 Timothy 2:5)",
        topics: ["jesus_christ"],
      },
      {
        heading: "03 — The Holy Spirit",
        text: "The Holy Spirit is the third Person of the Holy Trinity, who convicts regarding sin, righteousness, and judgment. He serves as the supernatural agent enabling spiritual rebirth, incorporating all believers into Christ's body, indwelling them, and sealing them until redemption's completion. The Spirit comforts, instructs, distributes spiritual gifts, recalls Jesus' teachings, and guides into complete truth. (John 14; John 16:8-11; 2 Corinthians 3:6; 1 Corinthians 12:12-14; Romans 8:9; Ephesians 5:18)",
        topics: ["holy_spirit", "spiritual_gifts"],
      },
      {
        heading: "04 — The Bible",
        text: "The Holy Bible is the authoritative Word of God. Scripture alone holds final doctrinal authority. In its original form, it maintains inspiration, infallibility, and inerrancy throughout. (2 Timothy 3:16; 2 Peter 1:20-21; Proverbs 30:5; Romans 16:25-26)",
        topics: ["scripture"],
      },
      {
        heading: "05 — Man",
        text: "God created Man in His own image and likeness as an upright moral and spiritual being. Through willful disobedience against divine instruction, humanity fell from this state; redemption through Jesus Christ, God's Son, represents humanity's singular hope. (Genesis 1:26-31, 3:1-7; Romans 5:12-21)",
        topics: ["creation", "salvation"],
      },
      {
        heading: "06 — Salvation",
        text: "Mankind's transgression caused separation from God, leaving all in hopelessness facing eternal judgment. God's love motivated sending Christ into the world. The sacrificial death of Jesus, and His blood shed on the cross, provides the only way of salvation. Salvation emerges when individuals trust Christ's death and resurrection as complete payment for their transgression. Salvation is a gift from God, and it cannot be earned through any self-effort. (Ephesians 2:8-9; Galatians 2:16, 3:8; Titus 3:5; Romans 10:9-10; Acts 16:31; Hebrews 9:22)",
        topics: ["salvation", "gospel"],
      },
      {
        heading: "07 — Water Baptism",
        text: "Following conversion to Christ, the new convert is commanded by the Word of God to be baptized in water in the Name of the Father and of the Son and of the Holy Spirit. (Matthew 28:19; Acts 2:38; Mark 16:16; Acts 8:12, 8:36-38, 10:47-48)",
        topics: ["baptism"],
      },
      {
        heading: "08 — The Lord's Supper",
        text: "A unique time of communion in the presence of God when the elements of bread and grape juice (the Body and Blood of the Lord Jesus Christ) are taken in remembrance of Jesus' sacrifice on the cross. (Matthew 26:26-29; 1 Corinthians 10:16, 11:23-25)",
        topics: ["communion"],
      },
      {
        heading: "09 — The Church",
        text: "The Church is the local and global community of believers who acknowledge Jesus as their Savior. The church transcends location, institutional structure, or weekly meeting. It constitutes the body of Christ, empowered by the Holy Spirit, and made up of born-again believers carrying Christ's Gospel mission globally. (Matthew 16:13-18; Acts 2:42-47; Ephesians 1:22, 2:19-22; Hebrews 12:23; John 17:11, 17:20-23)",
        topics: ["church", "ecclesiology", "missions"],
      },
      {
        heading: "10 — The Future",
        text: "Jesus Christ will physically and visibly return to earth for the second time to establish His Kingdom at an undisclosed time. Following earthly life, unbelievers face divine judgment and eternal separation from God. Believers will experience eternity with God in conscious joy. (Matthew 25:41; Mark 9:43-48; Hebrews 9:27; Revelation 14:9-11, 20:12-15, 21:1-5; Matthew 24:30, 26:63-64; Acts 1:9-11; 1 Thessalonians 4:15-17; 2 Thessalonians 1:7-8; Revelation 1:7)",
        topics: ["eschatology"],
      },
    ],
  },
  {
    key: "victory-church",
    organization: "Victory Church (Victory World Church)",
    location: "Norcross, GA",
    url: "https://victoryatl.com/about/our-beliefs/",
    note: "Named by the candidate as aligning with his theology. Non-denominational; small-groups centered.",
    fetchedAt: "2026-08-25",
    articles: [
      {
        heading: "We love God's Word",
        text: "The Bible is our blueprint for life! It is the inspired Word of God—the fruit of men who spoke and wrote as they were moved by the Holy Spirit, accepted as an infallible guide in all matters of life and doctrine.",
        topics: ["scripture"],
      },
      {
        heading: "Who is the Father, Jesus, and the Holy Spirit?",
        text: "We are in awe of God's greatness as the Trinity! There is one God, eternally existent in three persons: the Father, the Son, and the Holy Spirit being coequal and abiding in perfect unity.",
        topics: ["trinity", "jesus_christ", "holy_spirit"],
      },
      {
        heading: "Let's talk about sin and the cross",
        text: "We've all sinned. People were lovingly created by God, made in His likeness and His image, designed for relationship with Him. But through Adam's rebellion, sin came into the world. Jesus Christ came in the flesh and gave His life at the cross to pay our sin debt and restore us back to relationship with God.",
        topics: ["creation", "gospel"],
      },
      {
        heading: "What does it mean to be born again?",
        text: "Sin kills us, but Jesus brings us back to life! Salvation is the gift of God to mankind, which we receive by faith in Jesus Christ. Salvation comes through godly sorrow leading to repentance—turning away from sin and turning toward God. When we repent and place our faith in Jesus Christ as Lord and Savior, we are born again and become new in our spirits.",
        topics: ["salvation"],
      },
      {
        heading: "The meaning of water baptism",
        text: "Baptism in water by immersion is the next step in a person's discipleship after coming to faith in Jesus Christ. Through water baptism we are publicly identified with Christ's death, burial, and resurrection.",
        topics: ["baptism"],
      },
      {
        heading: "What does it mean to be baptized in the Holy Spirit?",
        text: "God's Holy Spirit empowers us to live for Him! Before Jesus was crucified, He told His disciples that He must leave so that the Holy Spirit could come.",
        topics: ["holy_spirit", "charismatic_theology", "spiritual_gifts"],
      },
      {
        heading: "Why does holiness matter?",
        text: "We believe in the Doctrine of Sanctification, understanding that holiness is a progressive work of grace, beginning at the time of salvation and continuing for the rest of our lives.",
        topics: ["sanctification"],
      },
      {
        heading: "What about gender, sexuality and marriage?",
        text: "God's Word affirms heterosexual union for married persons and faithful celibate behavior for unmarried persons as the only biblical options for sexual conduct. The Bible affirms that all alternative sexual activity outside of heterosexual marriage are sin.",
        topics: ["sexuality", "marriage"],
      },
      {
        heading: "God wants us to experience health and wholeness",
        text: "Physical healing of the human body is available to us by the power of God through the prayer of faith.",
        topics: ["charismatic_theology"],
      },
      {
        heading: "What about heaven?",
        text: "We find joy and hope in knowing Jesus defeated death and sin and will return for His people in the end!",
        topics: ["eschatology"],
      },
    ],
  },
  {
    key: "cfan",
    organization: "Christ for all Nations (CfaN)",
    location: "Orlando, FL · global evangelistic ministry",
    url: "https://cfan.org/what-we-believe",
    note: "Named by the candidate as aligning with his theology. Classical Pentecostal in its distinctives.",
    fetchedAt: "2026-08-25",
    articles: [
      {
        heading: "The Bible",
        text: "THE BIBLE is the inspired and only infallible and authoritative written Word of God.",
        topics: ["scripture"],
      },
      {
        heading: "One God",
        text: "There is ONE GOD, eternally existent in three Persons: God The Father, God The Son, God The Holy Spirit.",
        topics: ["trinity"],
      },
      {
        heading: "Jesus Christ",
        text: "In the Deity of our LORD JESUS CHRIST, His virgin birth, His sinless life, His miracles, His vicarious and atoning death, His bodily resurrection, His ascension to the right Hand of the Father, His personal future return to this earth in power and glory to rule.",
        topics: ["jesus_christ"],
      },
      {
        heading: "The Blessed Hope",
        text: "In the BLESSED HOPE — the rapture of the Church at Christ's second coming.",
        topics: ["eschatology"],
      },
      {
        heading: "Cleansing from sin",
        text: "The only means of being cleansed from sin is through repentance and faith in the precious BLOOD OF JESUS CHRIST.",
        topics: ["salvation", "gospel"],
      },
      {
        heading: "Regeneration",
        text: "Regeneration by the HOLY SPIRIT is essential for personal salvation.",
        topics: ["salvation", "holy_spirit"],
      },
      {
        heading: "Healing",
        text: "The redemptive work of Christ on THE CROSS provides healing for the body in response to believing prayer.",
        topics: ["charismatic_theology"],
      },
      {
        heading: "Baptism in the Holy Spirit",
        text: "The BAPTISM IN THE HOLY SPIRIT, according to Acts 2:4, is given to believers who ask for it, with the evidence of “speaking in tongues”.",
        topics: ["charismatic_theology", "spiritual_gifts", "holy_spirit"],
      },
      {
        heading: "Sanctification",
        text: "In the sanctifying power of the Holy Spirit, by whose indwelling the Christian is able to live a HOLY LIFE.",
        topics: ["sanctification"],
      },
      {
        heading: "Resurrection",
        text: "In the RESURRECTION of both the saved and the lost, the one to everlasting life and the other to everlasting damnation.",
        topics: ["eschatology"],
      },
    ],
  },
];

export const REFERENCE_BY_KEY = new Map(REFERENCE_STATEMENTS.map((r) => [r.key, r]));
