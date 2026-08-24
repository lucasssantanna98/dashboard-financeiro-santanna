import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0f172a",
        "surface-card": "#131e36",
        "surface-hover": "#1a2847",
        border: "#1e293b",
        "border-glow": "#334155",
        lucas: {
          light: "#60a5fa",
          DEFAULT: "#38bdf8",
          dark: "#0284c7",
        },
        esposa: {
          light: "#f472b6",
          DEFAULT: "#ec4899",
          dark: "#db2777",
        },
      },
    },
  },
  plugins: [],
};
export default config;