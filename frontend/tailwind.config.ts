import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    "#020617",
        surface:    "#0f172a",
        "surface-2": "#1e293b",
        accent:     "#6366f1",
        "accent-hover": "#818cf8",
        success:    "#22c55e",
        danger:     "#ef4444",
        warning:    "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ai-gradient":      "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "success-gradient": "linear-gradient(135deg, #22c55e, #16a34a)",
        "danger-gradient":  "linear-gradient(135deg, #ef4444, #dc2626)",
        "surface-gradient": "linear-gradient(180deg, #0f172a, #020617)",
      },
      boxShadow: {
        glow:    "0 0 30px rgba(99,102,241,0.35)",
        "glow-lg": "0 0 60px rgba(99,102,241,0.25), 0 0 120px rgba(99,102,241,0.1)",
        card:    "0 4px 32px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "fade-in":   "fadeInUp 0.4s ease forwards",
        shimmer:     "shimmer 1.5s infinite",
        "pulse-glow":"pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
