/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
        },
      },
    },
  },
  plugins: [],
};
