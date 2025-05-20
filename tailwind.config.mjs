/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#744BC4',
        'primary-dark': '#5F3DA3',
        'primary-light': '#9B7DD4',
        'user-bubble': '#0a84ff',
        'bot-bubble': '#e5e5ea',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}; 