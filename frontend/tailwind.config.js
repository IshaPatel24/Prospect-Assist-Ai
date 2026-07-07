/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy:  { DEFAULT: '#0A2342', light: '#0F2E52' },
        teal:  { DEFAULT: '#028090', dark: '#026d7a', light: '#02a0b0' },
        mint:  { DEFAULT: '#02C39A', light: '#04D9AA' },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0A2342 0%, #0F3460 50%, #028090 100%)',
        'gradient-teal':  'linear-gradient(135deg, #028090, #02C39A)',
        'gradient-card':  'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(244,247,250,0.9))',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(10,35,66,0.08), 0 1px 2px rgba(10,35,66,0.06)',
        'card-md': '0 4px 16px rgba(10,35,66,0.10), 0 2px 6px rgba(10,35,66,0.06)',
        'card-lg': '0 12px 32px rgba(10,35,66,0.14), 0 4px 12px rgba(10,35,66,0.08)',
        'glow':    '0 0 20px rgba(2,128,144,0.35)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
      animation: {
        'fade-in':    'fade-in 0.4s ease both',
        'slide-left': 'slide-in-left 0.35s ease both',
        'count-up':   'count-up 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
}
