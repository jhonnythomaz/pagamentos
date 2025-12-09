/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // <--- ISSO ATIVA O BOTÃO DE TEMA
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Azul padrão do seu projeto
      },
    },
  },
  plugins: [],
};
