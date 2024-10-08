const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    nextui({
      colors: {
        background: "rgb(4, 11, 15)",
        foreground: "rgb(211, 213, 215)",
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
          foreground: "rgb(211, 213, 215)",
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
    },
    ),
  ],
};