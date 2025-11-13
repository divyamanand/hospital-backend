import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A66C2',
          foreground: '#ffffff'
        },
        success: '#25A18E',
        danger: '#D32F2F',
        muted: '#F5F6FA'
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px'
      }
    }
  },
  plugins: []
} satisfies Config
