import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: false,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '100%',
        '2xl': '100%',
      },
    },
    extend: {
      // All brand colours defined in globals.css @theme
      borderRadius: {
        nav: "1.75rem",
        mega: "1.5rem",
        chip: "999px",
      },
      boxShadow: {
        nav: "0 16px 48px -30px rgba(15, 23, 42, 0.45)",
        mega: "0 24px 55px -30px rgba(0, 0, 0, 0.45)",
      },
      backdropBlur: {
        nav: "16px",
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        marquee: 'marquee 50s linear infinite',
        'marquee-reverse': 'marquee-reverse 50s linear infinite',
      },
      // ONE consistent font family — Inter for everything
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        slogan: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-inter)', 'monospace'],
      },
      // ONE consistent type scale (px → rem, line-height, letter-spacing)
      fontSize: {
        'display': ['clamp(3rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'heading-1': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'heading-2': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading-3': ['clamp(1.25rem, 2vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-4': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
        'label-xs': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.15em' }],
      },
    },
  },
  plugins: [],
}

export default config
