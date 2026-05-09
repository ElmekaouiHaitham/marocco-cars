import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        surface:  "#111318",
        card:     "#16181f",
        border:   "#252836",
        accent:   "#3b82f6",
        success:  "#22c55e",
        warning:  "#f59e0b",
        danger:   "#ef4444",
        violet:   "#8b5cf6",
      },
      animation: {
        "slide-down":  "slideDown 0.2s ease",
        "fade-in":     "fadeIn 0.3s ease",
        "badge-pulse": "badgePulse 2s ease-in-out infinite",
      },
      keyframes: {
        slideDown:  { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:     { from: { opacity: "0" }, to: { opacity: "1" } },
        badgePulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
      },
    },
  },
  plugins: [],
};

export default config;
