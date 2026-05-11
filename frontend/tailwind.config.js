/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Barlow Condensed', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e3a5f',
          600: '#1a3352',
          700: '#142840',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.06)',
        'btn-primary': '0 4px 14px -2px rgba(30,58,95,.4)',
        'btn-secondary': '0 4px 14px -2px rgba(249,115,22,.4)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, var(--sidebar-top) 0%, var(--sidebar-bottom) 100%)',
      },
    },
  },
  plugins: [],
}
