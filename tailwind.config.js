/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        neutral: 'var(--color-neutral)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        'base-100': 'var(--color-base-100)',
        'base-200': 'var(--color-base-200)',
        'base-300': 'var(--color-base-300)',
        surface: 'var(--color-surface)',
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'primary-content': 'var(--color-primary-content)'
      },
      // 8pt Grid Spacing System
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
      },
      // Modern iOS Border Radius
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      // Glassmorphism & iOS Shadows
      boxShadow: {
        'soft': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'float': '0 12px 40px rgba(99, 102, 241, 0.3)',
        'glow': '0 0 24px rgba(99, 102, 241, 0.5)',
      },
      // iOS Backdrop Blur
      backdropBlur: {
        'ios': '20px',
        'heavy': '30px',
      },
      // Modern Typography Scale
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      // iOS Animation Timing
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '400ms',
        'modal': '300ms',
      },
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      // Min Touch Targets (Apple HIG)
      minHeight: {
        'touch': '44px',
        'touch-large': '48px',
      },
      minWidth: {
        'touch': '44px',
        'touch-large': '48px',
      },
    }
  },
  plugins: []
};

