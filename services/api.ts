// services/api.ts
import { Transaction, NewTransaction } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- MOCKS (Dados locais para coisas que o banco ainda não tem tabela) ---
// Como seu banco só tem tabela de pagamentos, vamos guardar categorias e orçamento na memória do navegador por enquanto.
let localCategories = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Investimentos",
];
let localBudget = 5000;

// Função auxiliar para verificar erros da API
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

// 1. LISTAR TRANSAÇÕES
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    return handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
};

// 2. ADICIONAR UMA TRANSAÇÃO
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

// 3. ATUALIZAR TRANSAÇÃO (Por enquanto vamos simular deletando e criando de novo ou ignorando se o back não tiver PUT)
// Como o backend simples que fizemos não tem rota PUT (update), vamos improvisar no futuro.
// Por agora, para não quebrar, retornamos a própria transação.
export const updateTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  // Se você quiser implementar o UPDATE no server.cjs depois, a chamada seria aqui.
  // Por enquanto, fingimos que salvou para não dar erro na tela.
  return transaction;
};

// 4. DELETAR TRANSAÇÃO
export const deleteTransaction = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
};

// 5. ADICIONAR MÚLTIPLAS (Para parcelas)
export const addMultipleTransactions = async (
  transactions: NewTransaction[]
): Promise<Transaction[]> => {
  // Como o backend não tem inserção em lote, vamos chamar um por um (Promise.all)
  const promises = transactions.map((t) => addTransaction(t));
  return Promise.all(promises);
};

// --- FUNÇÕES DE CATEGORIA E ORÇAMENTO (MOCKADAS NO FRONTEND) ---

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    return handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return ["Alimentação", "Moradia", "Outros"]; // Fallback se der erro
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
  // Passamos o nome na URL (encodeURIComponent protege se tiver espaços ou acentos)
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(category)}`,
    {
      method: "DELETE",
    }
  );
  return handleResponse(response);
};
