import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // Turbopack + Tailwind v3 doesn't JIT-generate arbitrary opacity modifiers
      // (e.g. bg-x/72). Defining the full 0-100 scale makes every /NN resolve as a
      // theme lookup, which compiles correctly.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [String(i), (i / 100).toString()])
      ),
      boxShadow: {
        glow: "0 0 30px rgba(99, 102, 241, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
