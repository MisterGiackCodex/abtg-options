import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abtg: {
          bg: "#0b0d12",
          surface: "#141821",
          border: "#232836",
          gold: "#d4af37",
          goldDim: "#a88a2a",
          text: "#e8e9ee",
          muted: "#8a8fa3",
          profit: "#22c55e",
          loss: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
