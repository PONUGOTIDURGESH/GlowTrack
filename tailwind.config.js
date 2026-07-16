/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm rose / amber premium palette — no purple
        rose: {
          50: '#fff5f6', 100: '#ffe6e9', 200: '#ffd0d8', 300: '#ffb0bf',
          400: '#ff8aa3', 500: '#ff5e80', 600: '#f23d66', 700: '#cc2a51',
          800: '#a52044', 900: '#821a39',
        },
        sand: {
          50: '#fbf7f2', 100: '#f5ece0', 200: '#ead8c2', 300: '#dcc0a0',
          400: '#cba07c', 500: '#bd8760', 600: '#a06b4a', 700: '#7e543c',
          800: '#5d3f30', 900: '#3d2a21',
        },
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5dae2', 300: '#b0bac8',
          400: '#7d8a9f', 500: '#5a6a82', 600: '#46546b', 700: '#3a4456',
          800: '#2d3447', 900: '#1f2433', 950: '#131620',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 36, 51, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glass-lg': '0 20px 60px rgba(31, 36, 51, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        glow: '0 0 40px rgba(255, 94, 128, 0.35)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #fff5f6 0%, #fbf7f2 50%, #f5ece0 100%)',
        'gradient-rose': 'linear-gradient(135deg, #ff8aa3 0%, #ff5e80 100%)',
        'gradient-dawn': 'linear-gradient(160deg, #ffd0d8 0%, #ffe6e9 40%, #fbf7f2 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        pop: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
};
