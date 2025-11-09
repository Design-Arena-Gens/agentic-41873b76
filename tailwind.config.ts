import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edf4ff",
          100: "#d1e0ff",
          200: "#a3c0ff",
          300: "#74a1ff",
          400: "#4681ff",
          500: "#1a62ff",
          600: "#134bd1",
          700: "#0c369c",
          800: "#052067",
          900: "#010a33"
        }
      }
    }
  },
  plugins: []
};

export default config;
