/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        work: "#3B82F6",
        personal: "#8B5CF6",
        idea: "#F59E0B",
      },
      boxShadow: {
        floating: "0 22px 52px rgba(0, 0, 0, 0.42)",
      },
    },
  },
  plugins: [],
};
