/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif']
      },
      colors: {
        accent: {
          DEFAULT: '#0A84FF',
          50: '#EAF4FF',
          100: '#D6E9FF',
          200: '#ADD3FF',
          600: '#0A84FF',
          700: '#0468CC'
        }
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem'
      },
      transitionDuration: {
        DEFAULT: '200ms'
      }
    }
  },
  plugins: []
}
