/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        teal: {
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(15 23 42 / 0.05)',
        '2xs': '0 1px 1px 0 rgb(15 23 42 / 0.03)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xs': '0.125rem',
      },
    },
  },
  plugins: [],
}
