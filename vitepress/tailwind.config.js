/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./.vitepress/**/*.{vue,js,ts,jsx,tsx,md,mdx}",
    "./pages/**/*.md",
    "./posts/**/*.md",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 