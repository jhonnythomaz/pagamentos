// services/authService.ts

export interface User {
  id: number;
  email: string;
  name?: string;
  nome?: string;
}

// URL da API (Render)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const authService = {
  async login(email: string, senha: string): Promise<User> {
    try {
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
    // APENAS LIMPA OS DADOS. NÃO REDIRECIONA.
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },
};

export default authService;
