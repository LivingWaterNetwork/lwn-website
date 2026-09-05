import type { Config } from "tailwindcss";

// Palette is Concept 03.5, from 01-BRAND-FOUNDATION.md §6. No other colors
// belong in this build — no gradients, no SaaS blues, no neon accents.
//
// The four approved brand colors are byte-for-byte the brief's: Deep Forest
// #12332D, Aged Brass #C7974D, Limestone #F2EEE4, Mineral Sage #A8BDAE.
//
// `field` and `brass.dark` are NOT brand colors — they are UI tints derived for
// this build, and as first drawn they failed WCAG 2.1 AA as text. Measured on
// the built site: #65756F body copy came out at 4.19:1 on Limestone, 4.49:1 on
// Limestone Light and 3.65:1 on Limestone Dark, and #A87C39 at 3.46:1 and
// 2.82:1 — all under the 4.5:1 that normal-size text needs. That is the whole
// of the site's body copy and every eyebrow label failing AA.
//
// Both are darkened along their own hue until the worst light ground clears
// 4.5:1 (field 4.54-5.59:1, brass.dark 4.53-5.57:1). The change is small enough
// to read as the same colour and is the minimum that passes. Aged Brass itself
// is left alone: it is 5.18:1 on Deep Forest, where it is actually used for
// text, and only ever a rule or a border on light.
//
// If either value is edited, re-check it. Anything used for normal-size text on
// Limestone Dark #E5DFD0 needs 4.5:1 against THAT, not against Limestone.
const config: Config = {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#12332D",
          deep: "#0C231F",
          soft: "#1B453D",
        },
        brass: {
          DEFAULT: "#C7974D",
          light: "#D8B375",
          // Text-safe on every light ground; see the note above.
          dark: "#7E5D2B",
        },
        limestone: {
          DEFAULT: "#F2EEE4",
          light: "#F8F6EF",
          dark: "#E5DFD0",
        },
        sage: "#A8BDAE",
        // Body copy and eyebrow labels. Text-safe on every light ground; see
        // the note above.
        field: "#586661",
      },
      fontFamily: {
        display: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};
export default config;
