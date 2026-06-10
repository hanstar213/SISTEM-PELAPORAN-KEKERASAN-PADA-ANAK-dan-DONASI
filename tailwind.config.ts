import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // ─── Brand Palette ────────────────────────────────
        navy: {
          50: "#f0f4ff",
          100: "#e0e8ff",
          200: "#b9cdff",
          300: "#7ba4ff",
          400: "#3b72f9",
          500: "#1e4fd8",
          600: "#1439b3",
          700: "#0f2d8a",
          800: "#0F172A", // PRIMARY
          900: "#0a0f1f",
          950: "#060912",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#0D9488", // ACCENT
          600: "#0a7a70",
          700: "#0b635a",
          800: "#0d5049",
          900: "#0f3d3a",
          950: "#052e2b",
        },
        coral: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#F97316", // URGENT / CTA
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        warm: {
          50: "#FAFAF9", // BG
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
        },
        // ─── shadcn/ui semantic tokens ────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-bricolage)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(13, 148, 136, 0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(13, 148, 136, 0.5)" },
        },
        "mesh-move": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "counter-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "mesh-move": "mesh-move 20s ease-in-out infinite",
        "counter-up": "counter-up 0.5s ease-out forwards",
        "gradient-x": "gradient-x 8s ease infinite",
      },
      boxShadow: {
        glow: "0 0 20px rgba(13, 148, 136, 0.15)",
        "glow-lg": "0 0 40px rgba(13, 148, 136, 0.25)",
        "glow-coral": "0 0 20px rgba(249, 115, 22, 0.2)",
        soft: "0 2px 8px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)",
        "soft-lg": "0 4px 16px rgba(15, 23, 42, 0.08), 0 16px 48px rgba(15, 23, 42, 0.06)",
        card: "0 1px 4px rgba(15, 23, 42, 0.05), 0 4px 16px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 8px 32px rgba(15, 23, 42, 0.1), 0 16px 48px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
