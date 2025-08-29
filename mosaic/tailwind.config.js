/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core theme colors - Light: cream primary, dark secondary, coral accent
        // Dark mode: inverted with same coral accent
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: '#fefefe',
          dark: '#1a1a19',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: '#262625',
          dark: '#fefefe',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          coral: '#e0414f',
        },
        // Semantic color variables
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        hover: 'var(--color-hover)',
        active: 'var(--color-active)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
