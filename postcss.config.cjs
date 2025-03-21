/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ Make sure all components are included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};