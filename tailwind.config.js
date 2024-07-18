// /** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#effef1",
          100: "#dbfde0",
          200: "#b8fac2",
          300: "#81f494",
          400: "#43e55d",
          500: "#1bd039",
          600: "#10a929",
          700: "#108524",
          800: "#126921",
          900: "#11561e",
          950: "#03300d",
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
