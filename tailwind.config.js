/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: ['font-bebas', 'font-dancing', 'font-barlow'],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'sans-serif'],
        dancing: ['"Dancing Script"', 'cursive'],
        barlow: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
