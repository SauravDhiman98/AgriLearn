/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0f172a',
        sidebar: '#1e293b',
        card: '#1e293b',
        border: '#334155',
        accent: '#16a34a',
        'app-text': '#f1f5f9',
        muted: '#94a3b8',
      },
      boxShadow: {
        card: '0 10px 35px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
