/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--bg)',
          2: 'var(--bg2)',
          3: 'var(--bg3)',
          4: 'var(--bg4)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border2)',
        },
        content: {
          DEFAULT: 'var(--text)',
          2: 'var(--text2)',
          3: 'var(--text3)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          2: 'var(--accent2)',
          3: 'var(--accent3)',
        },
        success: 'var(--green)',
        danger: 'var(--red)',
        warning: 'var(--amber)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        app: '10px',
        'app-lg': '16px',
      },
      width: {
        sidebar: '260px',
      },
      height: {
        topbar: '56px',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        bounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease',
        pulse: 'pulse 2s infinite',
        bounce: 'bounce 1.2s infinite',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};

