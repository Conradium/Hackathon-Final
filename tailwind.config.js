/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#B91C1C", // Japan's Rising Sun Red
        secondary: "#b62020", // Soft White
        "text-dark": "#1F2937", // Dark Blue-Gray for readability
        "text-muted": "#6B7280",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to right, #B91C1C, #F5F5F5)",
        "card-gradient": "linear-gradient(to bottom right, #F87171, #F3F4F6)",
      },
    },
  },
  plugins: [],
};