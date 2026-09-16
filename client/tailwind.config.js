/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent)',
        'primary-hover': 'var(--accent-hover)'
      },
      borderRadius: {
        DEFAULT: 'var(--radius)'
      }
    }
  },
  plugins: []
};