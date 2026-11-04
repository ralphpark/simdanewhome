import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: { tablet: "734px", desktop: "1068px", wide: "1440px" },
      spacing: {
        "site-1": "var(--site-space-1)", "site-2": "var(--site-space-2)",
        "site-3": "var(--site-space-3)", "site-4": "var(--site-space-4)",
        "site-6": "var(--site-space-6)", "site-8": "var(--site-space-8)",
        "site-10": "var(--site-space-10)", "site-15": "var(--site-space-15)",
        "site-section": "var(--site-section)", "site-gutter": "var(--site-gutter)",
      },
      fontSize: {
        "site-hero": ["var(--site-hero)", { lineHeight: "var(--site-hero-leading)", letterSpacing: "var(--site-heading-tracking)", fontWeight: "600" }],
        "site-headline": ["var(--site-headline)", { lineHeight: "var(--site-headline-leading)", letterSpacing: "var(--site-heading-tracking)", fontWeight: "600" }],
        "site-title": ["var(--site-title)", { lineHeight: "var(--site-title-leading)", letterSpacing: "var(--site-heading-tracking)", fontWeight: "600" }],
        "site-subtitle": ["var(--site-subtitle)", { lineHeight: "var(--site-subtitle-leading)", letterSpacing: "var(--site-heading-tracking)", fontWeight: "600" }],
        "site-body": ["var(--site-body)", "var(--site-body-leading)"],
        "site-caption-size": ["var(--site-caption-size)", "var(--site-caption-leading)"],
      },
      transitionTimingFunction: { site: "var(--site-ease)" },
      transitionDuration: { "site-reveal": "var(--site-reveal-duration)" },
      transitionDelay: { "site-stagger": "var(--site-stagger)" },
      borderRadius: {
        "site-card": "var(--site-radius-card)", "site-tile": "var(--site-radius-tile)",
        "site-input": "var(--site-radius-input)", "site-pill": "var(--site-radius-pill)",
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
      },
      colors: {
        site: {
          white: "var(--site-white)", surface: "var(--site-surface)", black: "var(--site-black)",
          ink: "var(--site-ink)", secondary: "var(--site-secondary)", caption: "var(--site-caption)",
          green: "var(--site-green)", link: "var(--site-link)", gold: "var(--site-gold)",
        },
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        site: ["var(--site-font)"],
        sans: ["Inter", "Noto Sans KR", "var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
