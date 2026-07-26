/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgba(var(--rgb-background), <alpha-value>)',
        surface: 'rgba(var(--rgb-surface), <alpha-value>)',
        surfaceHover: 'rgba(var(--rgb-surface-hover), <alpha-value>)',
        primary: 'rgba(var(--rgb-primary), <alpha-value>)',
        secondary: 'rgba(var(--rgb-secondary), <alpha-value>)',
        textMain: 'rgba(var(--rgb-text-main), <alpha-value>)',
        textMuted: 'rgba(var(--rgb-text-muted), <alpha-value>)',
        borderFaint: 'var(--border-faint)',
        borderMain: 'var(--border-main)',
        borderStrong: 'var(--border-strong)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif']
      }
    },
  },
  plugins: [],
}