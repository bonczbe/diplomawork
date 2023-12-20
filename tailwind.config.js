/** @type {import('tailwindcss').Config} */
module.exports = {
  mode:'jit',
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'main-color': '#0C050D',
        'main-text-color': '#FFFFFE',
        'secondary-color': '#1A5DB4',
        'secondary-text-color': '#F2F2F2',
        'left-rigth-color': '#1A5DAF',
        'left-rigth-text-color': '#F2F2F2',
        'chat-elemen-color': '#20BCEC',
        'chat-elemen-text-color': '#F2F2F2',
        'nav-popup-color': '#0C050F',
        'profImage-bg-color': '#f2f2f2',
      },
      boxShadow: {
        'bigger': '0 0 6px 2px rgba(255, 255, 255, 0.35)',
        'smaller': '0 0 4px 2px rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
