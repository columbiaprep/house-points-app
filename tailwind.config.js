const { heroui } = require("@heroui/react");
const { Quicksand, Ledger } = require("next/font/google");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  safelist: [
    // Green Ivy
    'from-green-400',
    'to-emerald-700',
    'outline-emerald-900',
    'shadow-green-500/50',

    // Pink Panthers
    'from-pink-400',
    'to-fuchsia-700',
    'outline-fuchsia-900',
    'shadow-pink-500/50',

    // Blue Thunder
    'from-cyan-400',
    'to-blue-700',
    'outline-blue-900',
    'shadow-cyan-500/50',

    // Red Phoenix
    'from-red-400',
    'to-rose-700',
    'outline-rose-900',
    'shadow-red-500/50',

    // Purple Reign
    'from-purple-400',
    'to-violet-700',
    'outline-violet-900',
    'shadow-purple-500/50',

    // Golden Hearts
    'from-yellow-400',
    'to-yellow-700',
    'outline-yellow-900',
    'shadow-yellow-500/50',

    // Orange Supernova
    'from-orange-400',
    'to-amber-700',
    'outline-amber-900',
    'shadow-orange-500/50',

    // Silver Knights
    'from-gray-400',
    'to-slate-700',
    'outline-slate-900',
    'shadow-gray-500/50',
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 3px var(--glow-color)' },
          '50%': { boxShadow: '0 0 15px 6px var(--glow-color)' },
        },
      },
      animation: {
        glow: 'glow 2s infinite',
      },
      // fontFamily: {
      //   sans: [Quicksand, "sans-serif"],
      // }
    }
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
          layout: {
            fontSize: {
              small: "14px",
              medium: "16px",
              large: "18px",
            },
          }
        },
        dark: {
          colors: {
            foreground: "rgb(202, 203, 203)",
            background: "rgb(4, 11, 15)",
          }
        }
      },
      colors: {
        primary: {
          50: "rgb(12, 116, 174)",
          100: "rgb(15, 127, 189)",
          200: "rgb(20, 155, 235)",
          300: "rgb(22, 96, 139)",
          400: "rgb(53, 83, 98)",
          500: "rgb(108, 172, 204)",
          600: "rgb(108, 172, 204)",
          700: "rgb(108, 172, 204)",
          800: "rgb(108, 172, 204)",
          900: "rgb(108, 172, 204)",
          DEFAULT: "rgb(20, 155, 235)",
        },
        focus: "rgb(20, 155, 235)",
      },
      layout: {
        disabledOpacity: "0.3",
        radius: {
          small: "4px",
          medium: "6px",
          large: "8px",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    }),
  ],
};

