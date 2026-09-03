import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--color-page) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        neutral: {
          50: "#F8FAFB",
          100: "#F0F3F5",
          200: "#E2E8EC",
          300: "#C9D3D9",
          400: "#91A1AB",
          500: "#667782",
          600: "#4A5C67",
          700: "#334650",
          800: "#21343E",
          900: "#14252E",
          950: "#0A171D",
        },
      },
      borderRadius: {
        app: "12px",
        "app-sm": "8px",
        "app-lg": "16px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(18, 63, 92, 0.05), 0 8px 24px rgba(18, 63, 92, 0.06)",
        raised: "0 16px 40px rgba(18, 63, 92, 0.12)",
      },
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1rem" }],
        body: ["1rem", { lineHeight: "1.5rem" }],
        "section-title": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
        "page-title": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
      },
    },
  },
  plugins: [],
};

export default config;
