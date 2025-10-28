// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        slideX: {
          '0%':   { transform: 'translateX(-20px)' },
          '50%':  { transform: 'translateX(20px)' },
          '100%': { transform: 'translateX(-20px)' },
        },
      },
      animation: {
        slideX: 'slideX 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
