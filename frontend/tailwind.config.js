/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2f8',
          100: '#d6e0ef',
          500: '#0a1f44',
          600: '#081a3a',
          700: '#071530',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      boxShadow: {
        card: '0 1px 4px -1px rgba(10,31,68,.08), 0 0 0 1px rgba(10,31,68,.05)',
        'card-hover': '0 6px 20px -4px rgba(10,31,68,.12), 0 0 0 1px rgba(10,31,68,.07)',
        'btn-primary': '0 4px 14px -2px rgba(10,31,68,.4)',
        'btn-secondary': '0 4px 14px -2px rgba(249,115,22,.4)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, var(--sidebar-top) 0%, var(--sidebar-bottom) 100%)',
      },
    },
  },
  plugins: [],
}
