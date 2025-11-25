
// services/api.ts
import { Transaction, NewTransaction, TransactionCategory } from '../types';

const TRANSACTIONS_KEY = 'transactions_v2';
const CATEGORIES_KEY = 'categories_v1';
const BUDGET_KEY = 'monthly_budget_v1';

// Default categories
const DEFAULT_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Impostos', 'Eletrônicos', 'Outros'];

const getInitialTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    } catch (e) {
      console.error("Failed to parse transactions from localStorage", e);
      localStorage.removeItem(TRANSACTIONS_KEY);
    }
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const initialData: Transaction[] = [
    { id: '1', description: 'Pagamento do Aluguel', amount: 1200.00, date: formatDate(new Date(currentYear, currentMonth, 2)), dueDate: formatDate(new Date(currentYear, currentMonth, 5)), category: 'Moradia', status: 'Pago', accountType: 'Recorrente' },
    { id: '2', description: 'Supermercado', amount: 350.00, date: formatDate(new Date(currentYear, currentMonth, 5)), dueDate: formatDate(new Date(currentYear, currentMonth, 5)), category: 'Alimentação', status: 'Pago', accountType: 'Recorrente' },
    { id: '3', description: 'Notebook Novo', amount: 1500.00, date: formatDate(new Date(currentYear, currentMonth - 2, 10)), dueDate: formatDate(new Date(currentYear, currentMonth - 2, 10)), category: 'Eletrônicos', status: 'Pago', accountType: 'Não Recorrente', installments: '1/3' },
    { id: '4', description: 'Notebook Novo', amount: 1500.00, date: formatDate(new Date(currentYear, currentMonth - 1, 10)), dueDate: formatDate(new Date(currentYear, currentMonth - 1, 10)), category: 'Eletrônicos', status: 'Pago', accountType: 'Não Recorrente', installments: '2/3' },
    { id: '5', description: 'Notebook Novo', amount: 1500.00, date: formatDate(new Date(currentYear, currentMonth, 10)), dueDate: formatDate(new Date(currentYear, currentMonth, 10)), category: 'Eletrônicos', status: 'Pendente', accountType: 'Não Recorrente', installments: '3/3' },
    { id: '6', description: 'Conta de Luz/Água', amount: 150.00, date: formatDate(new Date(currentYear, currentMonth, 20)), dueDate: formatDate(new Date(currentYear, currentMonth, 20)), category: 'Serviços', status: 'Pendente', accountType: 'Recorrente' },
    { id: '7', description: 'Mensalidade da Academia', amount: 120.00, date: formatDate(new Date(currentYear, currentMonth, 15)), dueDate: formatDate(new Date(currentYear, currentMonth, 15)), category: 'Saúde', status: 'Pendente', accountType: 'Recorrente' },
    { id: '8', description: 'IPVA', amount: 700.00, date: formatDate(new Date(currentYear, currentMonth + 1, 16)), dueDate: formatDate(new Date(currentYear, currentMonth + 1, 16)), category: 'Impostos', status: 'Pendente', accountType: 'Recorrente' },
    { id: '10', description: 'Seguro do Carro', amount: 450.00, date: formatDate(new Date(currentYear, currentMonth - 1, 20)), dueDate: formatDate(new Date(currentYear, currentMonth - 1, 20)), category: 'Transporte', status: 'Pago', accountType: 'Recorrente' },
  ];

  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialData));
  return initialData;
};

let transactions: Transaction[] = getInitialTransactions();
let categories: string[] = [];

// Load categories from storage or default
const loadCategories = (): string[] => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse categories", e);
        }
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
};

categories = loadCategories();

const saveTransactions = () => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

const saveCategories = () => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return Promise.resolve([...transactions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
};

export const addTransaction = async (transaction: NewTransaction): Promise<Transaction> => {
  const newTransaction: Transaction = {
    ...transaction,
    id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
  };
  transactions.unshift(newTransaction);
  saveTransactions();
  return Promise.resolve(newTransaction);
};

export const addMultipleTransactions = async (newTransactions: NewTransaction[]): Promise<Transaction[]> => {
    const created: Transaction[] = newTransactions.map((t, index) => ({
        ...t,
        id: (new Date().getTime() + index).toString() + Math.random().toString(36).substr(2, 9),
    }));
    
    transactions.unshift(...created);
    saveTransactions();
    return Promise.resolve(created);
};

export const updateTransaction = async (updatedTransaction: Transaction): Promise<Transaction> => {
  transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
  saveTransactions();
  return Promise.resolve(updatedTransaction);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  return Promise.resolve();
};

// Category API
export const getCategories = async (): Promise<string[]> => {
    return Promise.resolve([...categories]);
};

export const addCategory = async (category: string): Promise<string[]> => {
    if (!categories.includes(category)) {
        categories.push(category);
        categories.sort();
        saveCategories();
    }
    return Promise.resolve([...categories]);
};

export const deleteCategory = async (category: string): Promise<string[]> => {
    categories = categories.filter(c => c !== category);
    saveCategories();
    return Promise.resolve([...categories]);
};

// Budget API
export const getBudget = async (): Promise<number> => {
    const data = localStorage.getItem(BUDGET_KEY);
    return Promise.resolve(data ? parseFloat(data) : 0);
};

export const setBudget = async (amount: number): Promise<number> => {
    localStorage.setItem(BUDGET_KEY, amount.toString());
    return Promise.resolve(amount);
};
