import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,html}'],
  theme: {
    extend: {
      colors: {
        salvee: {
          orange: '#FF6B00',
          'orange-light': '#FF8533',
          'orange-bg': '#FFF3EC',
          'orange-dark': '#CC5500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '390px',
      },
    },
  },
  plugins: [],
} satisfies Config

