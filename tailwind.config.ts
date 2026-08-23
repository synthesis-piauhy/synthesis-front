import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#F7F9FA",
        primary: "#123F5C",
        secondary: "#146E91",
        accent: "#00A5C8",
        warning: "#F58220",
        text: "#243746",
        muted: "#667785",
        border: "#D7E0E5",
        success: "#26865B",
        danger: "#C43D3D",
      },
      borderRadius: {
        app: "8px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(18, 63, 92, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
