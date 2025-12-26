/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Warm Studio Color Palette
      colors: {
        // Primary Cream/Sand Tones
        cream: {
          50: '#FFFCF7',
          100: '#FFF9F0',
          200: '#FFF3E0',
          300: '#FFE8C8',
          400: '#FFD9A8',
          500: '#F5D0A9',
          600: '#E5BC8A',
          700: '#C9A070',
          800: '#A88050',
          900: '#7D5930',
        },
        // Warm Amber Accent
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Rich Espresso/Brown
        espresso: {
          50: '#FAF7F5',
          100: '#F0EBE6',
          200: '#E0D5CC',
          300: '#C9B8A8',
          400: '#A89580',
          500: '#8B7355',
          600: '#6B5740',
          700: '#4A3C2B',
          800: '#2D2520',
          900: '#1A1612',
          950: '#0F0D0A',
        },
        // Copper Accent
        copper: {
          400: '#CD7F32',
          500: '#B87333',
          600: '#9A5E27',
        },
      },
      // Typography
      fontFamily: {
        'serif': ['Crimson Pro', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['Lato', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      // Animation Extensions
      animation: {
        'gradient': 'gradient 10s ease infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
        'glow': 'glow-pulse 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 8px rgba(217, 119, 6, 0.4))',
          },
          '50%': { 
            filter: 'drop-shadow(0 0 24px rgba(217, 119, 6, 0.7))',
          },
        },
      },
      // Shadow Extensions
      boxShadow: {
        'warm': '0 4px 20px -5px rgba(139, 69, 19, 0.15), 0 2px 8px -3px rgba(139, 69, 19, 0.1)',
        'warm-lg': '0 10px 40px -10px rgba(139, 69, 19, 0.2), 0 4px 16px -4px rgba(139, 69, 19, 0.12)',
        'warm-xl': '0 20px 50px -12px rgba(139, 69, 19, 0.25), 0 8px 20px -6px rgba(139, 69, 19, 0.15)',
        'amber-glow': '0 0 30px -5px rgba(217, 119, 6, 0.35)',
        'amber-glow-lg': '0 0 50px -10px rgba(217, 119, 6, 0.5)',
        'inner-warm': 'inset 0 2px 6px 0 rgba(139, 69, 19, 0.08)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      // Border Radius
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
      },
      // Background Image
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FFFCF7 0%, #FFF3E0 50%, #FFE8C8 100%)',
        'warm-gradient-dark': 'linear-gradient(135deg, #1A1612 0%, #2D2520 50%, #1A1612 100%)',
        'amber-gradient': 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        'radial-warm': 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
        'radial-warm-dark': 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
