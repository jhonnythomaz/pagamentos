
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum AccountCategory {
  RECURRING = 'recurring',
  NON_RECURRING = 'non_recurring',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string format
  type: TransactionType;
  category: string;
  accountType: AccountCategory;
  installments?: {
    current: number;
    total: number;
  };
  attachment?: string; // Filename of the uploaded PDF
}

export type NewTransaction = Omit<Transaction, 'id'>;

export enum View {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  REPORTS = 'reports',
}
