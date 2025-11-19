/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,jsx,ts,tsx}",
    "./src/renderer/index.html"
  ],
  theme: {
    extend: {
      colors: {
        win11: {
          bg: '#f3f3f3',
          card: '#ffffff',
          cardHover: '#f9f9f9',
          border: '#e5e5e5',
          accent: '#0067c0',
          accentHover: '#005a9e',
          text: '#000000',
          textSecondary: '#605e5c',
          success: '#107c10',
          error: '#d13438',
          warning: '#faa100'
        }
      },
      borderRadius: {
        'win11': '8px',
        'win11-sm': '4px'
      },
      boxShadow: {
        'win11': '0 8px 16px rgba(0,0,0,0.14)',
        'win11-sm': '0 2px 4px rgba(0,0,0,0.08)'
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
