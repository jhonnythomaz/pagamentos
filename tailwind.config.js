/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(221, 83%, 53%)', // Indigo 500
          hover: 'hsl(221, 83%, 48%)',
          light: 'hsl(221, 83%, 95%)',
          dark: 'hsl(221, 83%, 30%)',
        },
        danger: { DEFAULT: 'hsl(0, 72%, 51%)', light: 'hsl(0, 72%, 95%)', dark: 'hsl(0, 72%, 80%)' }, // Red 600
        success: { DEFAULT: 'hsl(142, 69%, 45%)', light: 'hsl(142, 69%, 95%)', dark: 'hsl(142, 69%, 80%)' }, // Green 600
        warning: { DEFAULT: 'hsl(38, 92%, 50%)', light: 'hsl(38, 92%, 95%)', dark: 'hsl(38, 92%, 80%)' }, // Amber 500
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
          'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
      animation: {
          'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
      },
      keyframes: {
          'fade-in-right': {
              '0%': { opacity: '0', transform: 'translateX(20px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
          },
      },
    },
  },
  plugins: [],
}
