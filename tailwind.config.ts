import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /^prose/ },
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A2A47",
          light: "#0D3459",
          dark: "#071e32",
        },
        "deep-sea": {
          DEFAULT: "#00466F",
          light: "#005585",
        },
        lw: {
          blue: "#0A77BC",
          "blue-light": "#1a87cc",
          "blue-dark": "#0862a0",
        },
        current: {
          DEFAULT: "#1FA6D6",
          light: "#36b5e2",
        },
        copper: {
          DEFAULT: "#C05A12",
          light: "#d4701e",
          dark: "#a34a0e",
        },
        spring: "#7CCBE6",
        mist: "#EAF1F6",
        slate: "#445563",
        // YAN Atlanta — namespaced brand palette, kept isolated from the LWN
        // tokens above so the two systems never collide or bleed into each other.
        yan: {
          navy: "#0B1120",
          blue: "#2563EB",
          "blue-light": "#3B82F6",
          "blue-dark": "#1D4ED8",
          clay: "#C49A6C",
          sage: "#5A755E",
          stone: "#E5E7EB",
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        "yan-heading": ["var(--font-yan-poppins)", "system-ui", "sans-serif"],
        "yan-body": ["var(--font-yan-manrope)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
