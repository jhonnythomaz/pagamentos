import { Transaction, NewTransaction } from "../types";

// Define a URL da API (Render ou Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Função auxiliar de resposta
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.mensagem ||
        errorData.erro ||
        "Erro na comunicação com o servidor"
    );
  }
  return response.json();
};

// --- TRANSAÇÕES (BANCO DE DADOS) ---

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    return handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
};

export const addTransaction = async (
  transaction: NewTransaction
): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  return handleResponse(response);
};

export const updateTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  // Backend ainda não tem PUT, retornamos o objeto para atualizar a tela
  return transaction;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
};

export const addMultipleTransactions = async (
  transactions: NewTransaction[]
): Promise<Transaction[]> => {
  const promises = transactions.map((t) => addTransaction(t));
  return Promise.all(promises);
};

// --- CATEGORIAS (BANCO DE DADOS) ---

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    return handleResponse(response);
  } catch (error) {
    return ["Alimentação", "Moradia", "Lazer"]; // Fallback
  }
};

export const addCategory = async (category: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  return handleResponse(response);
};

export const deleteCategory = async (category: string): Promise<string[]> => {
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(category)}`,
    {
      method: "DELETE",
    }
  );
  return handleResponse(response);
};

// --- ORÇAMENTO (LOCAL STORAGE - MOCK) ---
// Restauramos essas funções para o App.tsx não quebrar

export const getBudget = async (): Promise<number> => {
  const saved = localStorage.getItem("user_budget");
  return saved ? parseFloat(saved) : 5000;
};

export const setBudget = async (amount: number): Promise<number> => {
  localStorage.setItem("user_budget", amount.toString());
  return amount;
};

// Inicializador vazio para compatibilidade
export const initApi = (userId: number) => {};
