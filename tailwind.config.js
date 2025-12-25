/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00D4FF",
        secondary: "#FF4500",
        accent: "#FFD700",
        surface: "#1A1A2E",
        background: "#0F0F1E",
        success: "#00FF88",
        warning: "#FFA500",
        error: "#FF1744",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Rajdhani", "sans-serif"],
      },
    },
  },
  plugins: [],
};