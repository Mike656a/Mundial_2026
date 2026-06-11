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
          300: '#F5C842',
          400: '#E8B62E',
          500: '#D4A017',
          600: '#A87E10',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
