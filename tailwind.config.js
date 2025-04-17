/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'board-dark': '#769656',
        'board-light': '#eeeed2',
        'board-highlight': 'rgba(255, 215, 0, 0.5)',
        'gold-accent': '#d4af37',
        'wood-dark': '#8B4513',   // SaddleBrown
        'wood-medium': '#A0522D', // Sienna
        'wood-light': '#DEB887',  // BurlyWood
        'wood-lightest': '#F5DEB3', // Wheat
      }
    },
  },
  plugins: [],
} 