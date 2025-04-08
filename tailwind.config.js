const { heroui } = require("@heroui/react");
const { Quicksand, Ledger } = require("next/font/google");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class", // This enables dark mode support
  theme: {
    extend: {
      colors: {
        gold: "#FFD700", // Custom gold color for glowing effects
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(255, 255, 255, 0.8)', // Custom gold glow shadow for leaderboard tablet
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'], // Use Quicksand font from Google Fonts
        ledger: ['Ledger', 'serif'], // Use Ledger font from Google Fonts
      },
      animation: {
        popOut: 'popOut 0.3s ease-out', // The animation for popping out
      },
      keyframes: {
        popOut: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "light",
      themes: {
        light: {
          colors: {
            foreground: "rgb(4, 11, 15)",
            background: "rgb(243, 243, 243)",
          },
        },
        dark: {
          colors: {
            foreground: "rgb(202, 203, 203)",
            background: "rgb(4, 11, 15)",
          },
        },
      },
    }),
  ],
};
