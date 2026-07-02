/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./api/**/*.{js,ts}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cyber: {
          black: "#0a0a0f",
          dark: "#12121a",
          purple: "#ff00ff",
          cyan: "#00ffff",
          blue: "#0066ff",
          green: "#39ff14",
          orange: "#ff6600",
        },
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        cyber: ["Rajdhani", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 5px currentColor, 0 0 20px currentColor, 0 0 40px currentColor",
        neon2: "0 0 10px currentColor, 0 0 30px currentColor",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "glitch": "glitch 1s infinite",
        "scan": "scan 8s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.3)" },
        },
        glitch: {
          "0%, 90%, 100%": { transform: "translate(0)" },
          "92%": { transform: "translate(-2px, 1px)" },
          "94%": { transform: "translate(2px, -1px)" },
          "96%": { transform: "translate(-1px, -1px)" },
          "98%": { transform: "translate(1px, 1px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
