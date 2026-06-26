/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            h2: {
              background: 'linear-gradient(90deg, #194552 0%, #0d6e84 100%)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: '800',
              marginTop: '28px',
              marginBottom: '12px',
            },
            h3: {
              borderLeft: '4px solid #16a34a',
              backgroundColor: '#f0fdf4',
              color: '#14532d',
              padding: '8px 14px',
              borderRadius: '0 6px 6px 0',
              fontWeight: '700',
              marginTop: '20px',
              marginBottom: '10px',
            },
            h4: {
              color: '#0369a1',
              fontWeight: '700',
            },
            'thead tr': {
              background: 'linear-gradient(90deg, #194552 0%, #0d6e84 100%)',
            },
            'thead th': {
              color: '#fff',
              fontWeight: '700',
              padding: '11px 16px',
            },
            td: {
              padding: '10px 16px',
              verticalAlign: 'top',
            },
            table: {
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              fontSize: '13.5px',
            },
            'tbody tr:hover': {
              backgroundColor: '#f0f9ff',
            },
          },
        },
        invert: {
          css: {
            h2: { color: '#7dd3fc' },
            h3: { backgroundColor: '#052e16', color: '#86efac', borderColor: '#4ade80' },
            h4: { color: '#38bdf8' },
            'thead tr': { background: 'linear-gradient(90deg, #0f2a33 0%, #0d3d4a 100%)' },
            'thead th': { color: '#e0f2fe' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
