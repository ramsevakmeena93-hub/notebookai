/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Kalam', 'Caveat', 'cursive'],
        handclean: ['Caveat', 'cursive'],
      },
      colors: {
        paper: '#fefce8',
        paperdark: '#fef9c3',
        ink: '#1e3a5f',
        inkred: '#c0392b',
        inkgreen: '#27ae60',
        inkblue: '#2980b9',
        inkpurple: '#8e44ad',
        margin: '#f0e6ff',
        ruled: '#bfdbfe',
      },
      backgroundImage: {
        'ruled-lines': "repeating-linear-gradient(transparent, transparent 31px, #bfdbfe 31px, #bfdbfe 32px)",
        'dotted-paper': "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
        'graph-paper': "linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
