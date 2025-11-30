import React, { useState } from "react";
import { authService } from "../services/authService";

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede a pagina de recarregar
    setError("");
    setLoading(true);

    try {
      console.log("Tentando logar com:", email); // Vai aparecer no console
      await authService.login(email, password);
      console.log("Sucesso!");
      onLogin(); // Avisa o App que entrou
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Alecrim 🌿
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="admin@alecrim.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="123"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded text-center text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
        <div className="bg-gray-700 p-4 text-center text-gray-400 text-xs">
          Sistema conectado ao Banco de Dados
        </div>
      </div>
    </div>
  );
}
