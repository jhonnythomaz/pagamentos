
// services/api.ts
import { Transaction, NewTransaction } from '../types';

// Constantes base
const TRANSACTIONS_KEY_SUFFIX = '_transactions_v2';
const CATEGORIES_KEY_SUFFIX = '_categories_v1';
const BUDGET_KEY_SUFFIX = '_monthly_budget_v1';

// Estado local do serviço
let currentUserId: string | null = null;
let transactions: Transaction[] = [];
let categories: string[] = [];

// Default categories
const DEFAULT_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Impostos', 'Eletrônicos', 'Outros'];

// --- Helpers para chaves dinâmicas ---
const getTransactionsKey = () => `${currentUserId}${TRANSACTIONS_KEY_SUFFIX}`;
const getCategoriesKey = () => `${currentUserId}${CATEGORIES_KEY_SUFFIX}`;
const getBudgetKey = () => `${currentUserId}${BUDGET_KEY_SUFFIX}`;

// --- Inicialização ---

/**
 * Define o usuário atual e carrega seus dados específicos.
 * Deve ser chamado assim que o usuário faz login.
 */
export const initApi = (userId: string) => {
    currentUserId = userId;
    transactions = loadTransactions();
    categories = loadCategories();
};

const loadTransactions = (): Transaction[] => {
    if (!currentUserId) return [];
    
    const data = localStorage.getItem(getTransactionsKey());
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        } catch (e) {
            console.error("Failed to parse transactions", e);
        }
    }

    // Se não tiver dados para este usuário, cria dados iniciais de exemplo
    return createInitialData();
};

const createInitialData = (): Transaction[] => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const initialData: Transaction[] = [
        { id: '1', description: 'Exemplo: Aluguel', amount: 1200.00, date: formatDate(new Date(currentYear, currentMonth, 2)), dueDate: formatDate(new Date(currentYear, currentMonth, 5)), category: 'Moradia', status: 'Pago', accountType: 'Recorrente' },
        { id: '2', description: 'Exemplo: Supermercado', amount: 350.00, date: formatDate(new Date(currentYear, currentMonth, 5)), dueDate: formatDate(new Date(currentYear, currentMonth, 5)), category: 'Alimentação', status: 'Pago', accountType: 'Recorrente' },
    ];
    
    // Salva imediatamente para o usuário não perder o exemplo
    localStorage.setItem(getTransactionsKey(), JSON.stringify(initialData));
    return initialData;
};

const loadCategories = (): string[] => {
    if (!currentUserId) return [];

    const data = localStorage.getItem(getCategoriesKey());
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse categories", e);
        }
    }
    
    localStorage.setItem(getCategoriesKey(), JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
};

// --- Persistência ---

const saveTransactions = () => {
    if (!currentUserId) return;
    localStorage.setItem(getTransactionsKey(), JSON.stringify(transactions));
};

const saveCategories = () => {
    if (!currentUserId) return;
    localStorage.setItem(getCategoriesKey(), JSON.stringify(categories));
};

// --- Métodos Públicos (CRUD) ---

export const getTransactions = async (): Promise<Transaction[]> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    return Promise.resolve([...transactions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
};

export const addTransaction = async (transaction: NewTransaction): Promise<Transaction> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    const newTransaction: Transaction = {
        ...transaction,
        id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
    };
    transactions.unshift(newTransaction);
    saveTransactions();
    return Promise.resolve(newTransaction);
};

export const addMultipleTransactions = async (newTransactions: NewTransaction[]): Promise<Transaction[]> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    const created: Transaction[] = newTransactions.map((t, index) => ({
        ...t,
        id: (new Date().getTime() + index).toString() + Math.random().toString(36).substr(2, 9),
    }));
    
    transactions.unshift(...created);
    saveTransactions();
    return Promise.resolve(created);
};

export const updateTransaction = async (updatedTransaction: Transaction): Promise<Transaction> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    saveTransactions();
    return Promise.resolve(updatedTransaction);
};

export const deleteTransaction = async (id: string): Promise<void> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    return Promise.resolve();
};

// Category API
export const getCategories = async (): Promise<string[]> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    return Promise.resolve([...categories]);
};

export const addCategory = async (category: string): Promise<string[]> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    if (!categories.includes(category)) {
        categories.push(category);
        categories.sort();
        saveCategories();
    }
    return Promise.resolve([...categories]);
};

export const deleteCategory = async (category: string): Promise<string[]> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    categories = categories.filter(c => c !== category);
    saveCategories();
    return Promise.resolve([...categories]);
};

// Budget API
export const getBudget = async (): Promise<number> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    const data = localStorage.getItem(getBudgetKey());
    return Promise.resolve(data ? parseFloat(data) : 0);
};

export const setBudget = async (amount: number): Promise<number> => {
    if (!currentUserId) throw new Error("Usuário não autenticado na API");
    localStorage.setItem(getBudgetKey(), amount.toString());
    return Promise.resolve(amount);
};
