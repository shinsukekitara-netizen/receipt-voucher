/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8eef5',
          100: '#c5d3e4',
          200: '#9fb6cf',
          300: '#7899ba',
          400: '#5a83ab',
          500: '#3b6d9c',
          600: '#2e5a87',
          700: '#1a3a5c',
          800: '#122840',
          900: '#091525',
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
