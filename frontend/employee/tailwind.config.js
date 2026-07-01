/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (preserved for shared component compatibility)
        primary: "#005ab6",
        "primary-container": "#1672df",
        secondary: "#475f89",
        tertiary: "#934700",
        error: "#ba1a1a",
        background: "#f7f9fb",
        "on-surface": "#191c1e",
        "on-surface-variant": "#414753",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        // Employee theme accent
        accent: {
          DEFAULT: "#16a34a",
          light: "#22c55e",
          dark: "#15803d",
        },
      },
      fontFamily: {
        headline: ["Inter", "Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        'card': '14px',
        'pill': '999px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.06)',
        'md': '0 4px 16px rgba(0,0,0,0.08)',
        'lg': '0 8px 32px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
