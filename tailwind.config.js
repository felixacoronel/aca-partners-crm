/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#185FA5', dark: '#0C447C', light: '#E6F1FB' },
      }
    },
  },
  plugins: [],
}
