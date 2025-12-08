// services/authService.ts

export interface User {
  id: number;
  email: string;
  name?: string;
  nome?: string;
}

// AQUI ESTÁ A CORREÇÃO: Usa a URL da Vercel ou Localhost dependendo de onde está rodando
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const authService = {
  async login(email: string, senha: string): Promise<User> {
    try {
      // Agora ele usa a variável API_URL, não mais o localhost fixo
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || "Erro ao fazer login");
      }

      localStorage.setItem("user", JSON.stringify(data.usuario));
      return data.usuario;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },
};

export default authService;
