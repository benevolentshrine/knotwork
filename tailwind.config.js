/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        vulcan: '#000000',
        quartz: '#A0A0A0',
        purple: {
          light: '#A78BFA',
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
        },
      },
    },
  },
  plugins: [],
}
