import type { Config } from "tailwindcss";

/**
 * Deliberately restrained palette: this is an internal decision-support tool.
 * Classification colors are the only strong hues, so score bands read at a glance.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#12181f", muted: "#5b6672", faint: "#8a95a1" },
        surface: { DEFAULT: "#ffffff", sunken: "#f5f7f9", raised: "#ffffff" },
        line: "#e2e7ec",
        priority: "#0f766e",
        strong: "#1d4ed8",
        review: "#b45309",
        pass: "#6b7280",
        danger: "#b91c1c",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
