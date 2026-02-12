/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          violet: "#8b5cf6",
          cyan: "#22d3ee",
          indigo: "#6366f1"
        }
      },
      boxShadow: {
        glass: "0 20px 44px rgba(148, 163, 184, 0.22)",
        "glass-dark": "0 8px 30px rgba(14, 20, 36, 0.45)",
        "glass-hover": "0 20px 45px rgba(67, 56, 202, 0.28)"
      }
    }
  },
  plugins: []
};