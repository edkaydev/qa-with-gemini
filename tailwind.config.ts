import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        umu: {
          red: "#CC0000",
          "red-dark": "#A30000",
          "red-soft": "#FFF1F1",
          yellow: "#F5C800",
          "yellow-light": "#FFF4B2",
          "yellow-soft": "#FFFBEB",
          black: "#1A1A1A",
        },
        ink: "#1A1A2E",
        muted: "#64748B",
        faint: "#94A3B8",
        line: "#E2E8F0",
        surface: {
          0: "#FFFFFF",
          1: "#F8F9FA",
          2: "#F1F3F5",
          3: "#E9ECEF",
        },
        success: {
          DEFAULT: "#15803D",
          soft: "#DCFCE7",
          line: "#BBF7D0",
        },
        warning: {
          DEFAULT: "#B45309",
          soft: "#FEF3C7",
          line: "#FDE68A",
        },
        danger: {
          DEFAULT: "#B91C1C",
          soft: "#FEE2E2",
          line: "#FECACA",
        },
        info: {
          DEFAULT: "#1D4ED8",
          soft: "#DBEAFE",
          line: "#BFDBFE",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26, 26, 46, 0.04)",
        lift: "0 12px 32px rgba(26, 26, 46, 0.08)",
        float: "0 24px 64px rgba(26, 26, 46, 0.12)",
        "focus-red": "0 0 0 4px rgba(204, 0, 0, 0.12)",
      },
      borderRadius: {
        DEFAULT: "10px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "26px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        caret: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "dot-bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        caret: "caret 1s step-end infinite",
        "dot-bounce": "dot-bounce 1.2s ease-in-out infinite",
        "draw-check": "draw-check 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        glow: "glow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
