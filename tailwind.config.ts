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
        canvas: {
          DEFAULT: "#F8F8F6",
          warm: "#F6F4EF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#EFECE6",
          subtle: "#F3F1EC",
        },
        ink: {
          primary: "#181A1F",
          secondary: "#646873",
          muted: "#8C909B",
        },
        brand: {
          sage: "#2E6F5E",
          "sage-dark": "#234B3E",
          "sage-soft": "#E7F2EF",
          "sage-hover": "#255c4e",
        },
        accent: {
          lime: "#8CE07A",
          terracotta: "#D96B43",
          amber: "#E5A93B",
        },
        status: {
          warn: "#F59E0B",
          alert: "#E11D48",
          success: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(24, 26, 31, 0.04)",
        card: "0 4px 20px rgba(24, 26, 31, 0.05)",
        floating: "0 12px 36px rgba(24, 26, 31, 0.08)",
      },
      borderRadius: {
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
