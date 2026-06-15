/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en FC26: fondo oscuro profundo + acento dorado
        pitch: {
          950: '#06080F',
          900: '#0A0E1A',
          800: '#0D1B2A',
          700: '#13263C',
          600: '#1A3A5C',
        },
        gold: {
          200: '#F8DA7E',
          300: '#F5C842',
          400: '#E8B62E',
          500: '#D4A017',
          600: '#A87E10',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,160,23,0.25), 0 12px 30px -12px rgba(212,160,23,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
