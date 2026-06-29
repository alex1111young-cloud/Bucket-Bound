/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#ff385c', dark: '#e0314f' },
        near: '#222222',
        surface: '#f2f2f2',
        secondary: '#6a6a6a',
        border: '#c1c1c1',
        luxe: '#460479',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        card: '20px',
        lg2: '14px',
        xl2: '32px',
      },
      boxShadow: {
        card: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.10) 0px 4px 8px',
        lift: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px, rgba(0,0,0,0.14) 0px 8px 20px',
      },
      letterSpacing: {
        tight2: '-0.44px',
        tight1: '-0.18px',
      },
    },
  },
  plugins: [],
}
