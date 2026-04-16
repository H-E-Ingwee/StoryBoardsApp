/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nuruOrange: '#F27D16',
        nuruBlue: '#032940',
        nuruMaroon: '#730E20',
      }
    },
  },
  plugins: [],
}
