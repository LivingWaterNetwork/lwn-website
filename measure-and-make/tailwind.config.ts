import type { Config } from "tailwindcss";

// Palette is Concept 03.5, verbatim from 01-BRAND-FOUNDATION.md §6. No other
// colors belong in this build — no gradients, no SaaS blues, no neon accents.
const config: Config = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
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
          dark: "#A87C39",
        },
        limestone: {
          DEFAULT: "#F2EEE4",
          light: "#F8F6EF",
          dark: "#E5DFD0",
        },
        sage: "#A8BDAE",
        field: "#65756F",
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
