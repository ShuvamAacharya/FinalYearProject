/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F1FF',
          100: '#D1E3FF',
          200: '#A3C6FF',
          300: '#75AAFF',
          400: '#4A90E2', // Secondary Gradient Stop
          500: '#2F6FDB', // Primary Blue
          600: '#235BB4',
          700: '#17478D',
          800: '#0E3366',
          900: '#061E3F',
        },
        background: '#F5F7FB',
        textMuted: '#6B7280',
        textHeading: '#2D3748',
        pastel: {
          success: '#DFF5EC',
          warning: '#FFF4D6',
          info: '#E8F1FF',
          social: '#FFEAE6',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        heading: '0.02em',
      },
      boxShadow: {
        soft: '0 6px 18px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}