/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}", // Pega App.tsx e main.tsx na raiz
    "./components/**/*.{js,ts,jsx,tsx}", // Pega tudo dentro de components
    "./src/**/*.{js,ts,jsx,tsx}", // Pega src se existir
  ],
  darkMode: "class", // Importante para o botão funcionar
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
      },
    },
  },
  plugins: [],
};
