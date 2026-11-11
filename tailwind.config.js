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
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c2d2e5',
          300: '#93b2d4',
          400: '#5e8fc0',
          500: '#3970aa',
          600: '#28568c',
          700: '#1e4271',
          800: '#142c4f',
          900: '#0c1b33',
          950: '#060d1b',
        },
        gold: {
          50: '#fbf9ed',
          100: '#f5f0d2',
          200: '#ece0a6',
          300: '#e0ca71',
          400: '#d5b244',
          500: '#c59d28',
          600: '#a97f1f',
          700: '#865f1c',
          800: '#6f4d1d',
          900: '#5e411e',
          950: '#37230d',
        }
      },
      fontFamily: {
        sans: ['Spectral', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Spectral', 'Playfair Display', 'Georgia', 'serif'],
        spectral: ['Spectral', 'Georgia', 'serif'],
        script: ['Great Vibes', 'Alex Brush', 'Dancing Script', 'cursive'],
        heading: ['Spectral', 'Cinzel', 'Playfair Display', 'serif'],
        caveat: ['Caveat', 'cursive'],
      }
    },
  },
  plugins: [],
}

