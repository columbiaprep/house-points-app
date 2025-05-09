const { heroui } = require("@heroui/react");
const { Quicksand, Ledger } = require("next/font/google");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
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

