// services/api.ts
import { Transaction, NewTransaction } from '../types';

const TRANSACTIONS_KEY = 'transactions_v2';

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

const saveTransactions = () => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return Promise.resolve([...transactions].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
};

export const addTransaction = async (transaction: NewTransaction): Promise<Transaction> => {
  const newTransaction: Transaction = {
    ...transaction,
    id: new Date().getTime().toString(),
  };
  transactions.unshift(newTransaction);
  saveTransactions();
  return Promise.resolve(newTransaction);
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