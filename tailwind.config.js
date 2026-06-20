/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        coffee: {
          DEFAULT: '#C4956A',
          light: '#D4AE87',
          dark: '#8B6341',
        },
        cream: '#FFF8F0',
        warm: {
          50: '#FFFBF5',
          100: '#F9F0E3',
          200: '#E8DCC8',
          300: '#D4C4A8',
          400: '#B8A584',
        },
        pink: {
          DEFAULT: '#FFB6C1',
          dark: '#FF9EB0',
        },
        mint: {
          DEFAULT: '#98D8C8',
          dark: '#7BC4B2',
        },
        sunset: '#FFB38A',
        peach: '#FFC9A0',
        lavender: '#D4B5E8',
        gold: '#F0C040',
        danger: '#FF8A8A',
      },
      fontFamily: {
        cute: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'bob': 'bob 1s ease-in-out infinite',
        'bob-slow': 'bob 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'happy': 'happy 0.6s ease-in-out',
        'float-up': 'floatUp 1.5s ease-out forwards',
        'float-heart': 'floatHeart 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-3px) rotate(-2deg)' },
          '75%': { transform: 'translateY(-3px) rotate(2deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px) rotate(-3deg)' },
          '40%': { transform: 'translateX(6px) rotate(3deg)' },
          '60%': { transform: 'translateX(-4px) rotate(-2deg)' },
          '80%': { transform: 'translateX(4px) rotate(2deg)' },
        },
        happy: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.15) rotate(-5deg)' },
          '60%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1.3)' },
        },
        floatHeart: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-8px) scale(1.1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
