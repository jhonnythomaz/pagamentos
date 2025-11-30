// services/authService.ts

export interface User {
  id: number;
  email: string;
  nome: string;
}

// Removi o "export" daqui do começo
const authService = {
  async login(email: string, senha: string): Promise<User> {
    try {
      // Chama o seu servidor local na porta 3000
      const response = await fetch("http://localhost:3000/api/login", {
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

      // Se deu certo, salva os dados do usuário no navegador e retorna
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

// AQUI ESTÁ A CORREÇÃO MÁGICA:
export default authService;
// Mantivemos a exportação nomeada também por segurança caso outro arquivo use
export { authService };
