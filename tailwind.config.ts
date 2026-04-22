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
          navy: "#EF7B10",
          navyDark: "#C75F00",
          navyLight: "#FF9B3D",
          gold: "#EF7B10",
          goldDim: "#C75F00",
          text: "#1A202C",
          muted: "#64748B",
          profit: "#16A34A",
          loss: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
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
