/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0EA5E9',
        'medical-green': '#10B981',
        'emergency-red': '#EF4444',
        'warning-amber': '#F59E0B',
        'bg-light': '#F0F9FF',
        'text-dark': '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
