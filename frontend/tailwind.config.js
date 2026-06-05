/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soft: {
          primary: '#6C5CE7',
          secondary: '#A29BFE',
          accent: '#FD79A8',
          success: '#00B894',
          warning: '#FDCB6E',
          danger: '#E17055',
          info: '#74B9FF',
          bg: '#F8F9FE',
          card: '#FFFFFF',
          'card-hover': '#F1F2F8',
          text: '#2D3436',
          'text-muted': '#636E72',
          border: '#E8E9F0',
        },
        'soft-dark': {
          bg: '#1A1A2E',
          card: '#16213E',
          'card-hover': '#1F2B4F',
          text: '#EAEAEA',
          'text-muted': '#A0A0B8',
          border: '#2A2A4A',
          primary: '#A29BFE',
        },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(108, 92, 231, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 8px 40px rgba(108, 92, 231, 0.10), 0 4px 16px rgba(0, 0, 0, 0.06)',
        'soft-xl': '0 16px 60px rgba(108, 92, 231, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'soft-inner': 'inset 0 2px 6px rgba(0, 0, 0, 0.04)',
        'soft-button': '0 4px 14px rgba(108, 92, 231, 0.25)',
        'soft-dark': '0 4px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
        'soft-dark-lg': '0 8px 40px rgba(0, 0, 0, 0.30), 0 4px 16px rgba(0, 0, 0, 0.20)',
      },
      borderRadius: {
        soft: '16px',
        'soft-sm': '12px',
        'soft-xs': '8px',
        'soft-full': '24px',
      },
      fontFamily: {
        soft: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
