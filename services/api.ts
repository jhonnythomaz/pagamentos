import { Transaction, NewTransaction, AccountCategory, TransactionStatus } from '../types';

let transactions: Transaction[] = [
  { id: '2', description: 'Pagamento do Aluguel', amount: 1200, date: '2024-07-02T11:00:00Z', category: 'Moradia', accountType: AccountCategory.RECURRING, status: TransactionStatus.PAID },
  { id: '3', description: 'Supermercado', amount: 350, date: '2024-07-05T15:30:00Z', category: 'Alimentação', accountType: AccountCategory.RECURRING, status: TransactionStatus.PAID },
  { id: '4', description: 'Notebook Novo', amount: 1500, date: '2024-07-10T14:00:00Z', category: 'Eletrônicos', accountType: AccountCategory.NON_RECURRING, installments: { current: 1, total: 3 }, status: TransactionStatus.PAID },
  { id: '6', description: 'Conta de Luz/Água', amount: 150, date: '2024-06-20T09:00:00Z', category: 'Serviços', accountType: AccountCategory.RECURRING, status: TransactionStatus.PAID },
  { id: '7', description: 'Notebook Novo', amount: 1500, date: '2024-08-10T14:00:00Z', category: 'Eletrônicos', accountType: AccountCategory.NON_RECURRING, installments: { current: 2, total: 3 }, status: TransactionStatus.PENDING },
  { id: '9', description: 'Conta de Internet', amount: 99, date: '2024-08-05T10:00:00Z', category: 'Serviços', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING },
  { id: '10', description: 'Seguro do Carro', amount: 450, date: '2024-08-20T10:00:00Z', category: 'Transporte', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING },
  { id: '11', description: 'Mensalidade da Academia', amount: 120, date: '2024-08-15T10:00:00Z', category: 'Saúde', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING },
  { id: '12', description: 'Conta de Telefone', amount: 75, date: '2024-07-28T10:00:00Z', category: 'Serviços', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING },
  { id: '13', description: 'Manutenção do carro', amount: 600, date: '2024-07-18T10:00:00Z', category: 'Transporte', accountType: AccountCategory.NON_RECURRING, status: TransactionStatus.PAID },
  { id: '14', description: 'IPTU', amount: 250, date: '2024-09-10T10:00:00Z', category: 'Impostos', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING },
  { id: '15', description: 'IPVA', amount: 700, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), category: 'Impostos', accountType: AccountCategory.RECURRING, status: TransactionStatus.PENDING }, // Vencido há 3 dias
];

export const getTransactions = async (): Promise<Transaction[]> => {
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addTransaction = async (transaction: NewTransaction): Promise<Transaction> => {
  await new Promise(res => setTimeout(res, 300));
  const newTransaction: Transaction = { 
    ...transaction, 
    id: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  return newTransaction;
};

export const updateTransaction = async (id: string, updates: Partial<NewTransaction>): Promise<Transaction> => {
    await new Promise(res => setTimeout(res, 300));
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    transactions[index] = { ...transactions[index], ...updates } as Transaction;
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