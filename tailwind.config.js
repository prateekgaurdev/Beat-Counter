/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E0F1A',
        surface: '#1A1B2E',
        surfaceHover: '#252740',
        primary: '#F0A03C', // Saffron/amber for Sam
        secondary: '#2DD4BF', // Teal for Tali
        textMain: '#FFFFFF',
        textMuted: '#9CA3AF'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif']
      }
    },
  },
  plugins: [],
}