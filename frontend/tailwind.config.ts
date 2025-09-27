import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.css"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class",
};

export default config;


