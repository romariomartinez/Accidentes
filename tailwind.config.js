/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hospital: {
          navy: '#163A5F',
          teal: '#159A9C',
          green: '#15803D',
          bg: '#F4F7FA',
        },
      },
      boxShadow: {
        sheet: '0 24px 60px rgba(22, 58, 95, 0.18)',
      },
    },
  },
  plugins: [],
};
