import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abtg: {
          bg: "#F5F7FA",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          navy: "#1B2B5E",
          navyDark: "#111D3E",
          navyLight: "#2D4A9A",
          gold: "#C9A84C",
          goldDim: "#A88735",
          text: "#1A202C",
          muted: "#64748B",
          profit: "#16A34A",
          loss: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)",
        elevated: "0 8px 24px 0 rgba(27,43,94,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
