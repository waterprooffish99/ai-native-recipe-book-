/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./docs/**/*.{md,mdx}",
  ],
  darkMode: 'class', // Enable dark mode by default
  theme: {
    extend: {
      colors: {
        globalplate: {
          bg: '#1a1a2e',
          'bg-dark': '#1a1a2e',
          'bg-surface': '#16213e',
          'bg-card': '#0f3460',
          card: '#0f3460',
          accent: '#e94560',
          text: '#e8e8e8',
          'text-primary': '#e8e8e8',
          'text-secondary': '#b0b0b0',
          'text-muted': '#6c757d',
          muted: '#6c757d',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'cook-mode': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
