import { Transaction, NewTransaction, TransactionType, AccountCategory } from '../types';

let transactions: Transaction[] = [
  { id: '1', description: 'Salário Mensal', amount: 5000, date: '2024-07-01T10:00:00Z', type: TransactionType.INCOME, category: 'Salário', accountType: AccountCategory.RECURRING },
  { id: '2', description: 'Pagamento do Aluguel', amount: 1200, date: '2024-07-02T11:00:00Z', type: TransactionType.EXPENSE, category: 'Moradia', accountType: AccountCategory.RECURRING },
  { id: '3', description: 'Supermercado', amount: 350, date: '2024-07-05T15:30:00Z', type: TransactionType.EXPENSE, category: 'Alimentação', accountType: AccountCategory.RECURRING },
  { id: '4', description: 'Notebook Novo', amount: 1500, date: '2024-07-10T14:00:00Z', type: TransactionType.EXPENSE, category: 'Eletrônicos', accountType: AccountCategory.NON_RECURRING, installments: { current: 1, total: 3 } },
  { id: '5', description: 'Projeto Freelance', amount: 750, date: '2024-07-15T18:00:00Z', type: TransactionType.INCOME, category: 'Freelance', accountType: AccountCategory.NON_RECURRING },
  { id: '6', description: 'Conta de Luz/Água', amount: 150, date: '2024-06-20T09:00:00Z', type: TransactionType.EXPENSE, category: 'Serviços', accountType: AccountCategory.RECURRING },
  { id: '7', description: 'Notebook Novo', amount: 1500, date: '2024-08-10T14:00:00Z', type: TransactionType.EXPENSE, category: 'Eletrônicos', accountType: AccountCategory.NON_RECURRING, installments: { current: 2, total: 3 } },
  { id: '8', description: 'Salário de Junho', amount: 5000, date: '2024-06-01T10:00:00Z', type: TransactionType.INCOME, category: 'Salário', accountType: AccountCategory.RECURRING },
];

export const getTransactions = async (): Promise<Transaction[]> => {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addTransaction = async (transaction: NewTransaction): Promise<Transaction> => {
  await new Promise(res => setTimeout(res, 300));
  const newTransaction: Transaction = { ...transaction, id: new Date().toISOString() };
  transactions.push(newTransaction);
  return newTransaction;
};

export const updateTransaction = async (id: string, updates: Partial<NewTransaction>): Promise<Transaction> => {
    await new Promise(res => setTimeout(res, 300));
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    transactions[index] = { ...transactions[index], ...updates };
    return transactions[index];
};


export const deleteTransaction = async (id: string): Promise<void> => {
  await new Promise(res => setTimeout(res, 300));
  transactions = transactions.filter(t => t.id !== id);
};

export const getCategories = async (): Promise<string[]> => {
    await new Promise(res => setTimeout(res, 100));
    const uniqueCategories = [...new Set(transactions.map(t => t.category))];
    return uniqueCategories;
}