/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#f5f3ff',
          100: '#ece9ff',
          500: '#635bff',
          600: '#5048e5',
          700: '#4339c9',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
        'btn-primary': '0 4px 14px -2px rgba(99,91,255,.4)',
        'btn-secondary': '0 4px 14px -2px rgba(249,115,22,.4)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, var(--sidebar-top) 0%, var(--sidebar-bottom) 100%)',
      },
    },
  },
  plugins: [],
}
