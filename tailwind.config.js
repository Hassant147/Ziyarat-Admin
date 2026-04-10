/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf6",
          100: "#daf4e9",
          200: "#b7e9d6",
          500: "#0a8f67",
          600: "#087b58",
          700: "#065f45",
        },
        ink: {
          900: "#182230",
          700: "#344054",
          500: "#667085",
          300: "#98a2b3",
        },
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
        kd: ["K2D", "Manrope", "sans-serif"],
        k2d: ["K2D", "Manrope", "sans-serif"],
      },
      boxShadow: {
        "custom-box": "0 6px 16px rgba(15, 23, 42, 0.06)",
        "custom-shadow": "0 26px 60px rgba(10, 31, 22, 0.14)",
        "custom-shadow1": "0 1px 2px rgba(16, 24, 40, 0.05)",
      },
      borderRadius: {
        panel: "20px",
      },
      maxWidth: {
        panel: "1280px",
      },
      backgroundImage: {
        "brand-hero":
          "linear-gradient(120deg, #d8efe8 0%, #d0ece6 55%, #e8f3f1 100%)",
      },
    },
  },
  plugins: [],
};
