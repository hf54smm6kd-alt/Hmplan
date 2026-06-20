/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // readiness traffic-light palette, reused across the app
        green: { DEFAULT: '#16a34a' },
        amber: { DEFAULT: '#d97706' },
      },
    },
  },
  plugins: [],
}
