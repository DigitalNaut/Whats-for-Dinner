/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,css}", "./public/*.html"],
  theme: {
    extend: {
      backgroundImage: {
        "transparent-geometry": "url('/src/assets/transparent-geometry.svg')",
      },
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      configViewer: {
        themeReplacements: {},
      },
      fontFamily: {
        bangers: ["Bangers", "cursive"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
    screens: {
      xs: "360px",
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
};
