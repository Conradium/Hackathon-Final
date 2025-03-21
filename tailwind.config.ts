import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate"; // ✅ Plugin Import

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["SF Pro Display", "Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1E3A8A", // Deep Blue (Professional & Trustworthy)
          foreground: "#F8FAFC",
        },
        secondary: {
          DEFAULT: "#64748B", // Cool Gray (Subtle Contrast)
          foreground: "#E2E8F0",
        },
        accent: {
          DEFAULT: "#14B8A6", // Soft Teal (Modern & Friendly)
          foreground: "#F8FAFC",
        },
        background: {
          DEFAULT: "#F8FAFC", // Off-White (Easy on Eyes)
          foreground: "#1E293B",
        },
        muted: {
          DEFAULT: "#CBD5E1", // Light Gray for Text
          foreground: "#475569",
        },
        border: "#E2E8F0", // Light Gray Borders
        ring: "#3B82F6", // Soft Blue Ring for Focus
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.7s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
