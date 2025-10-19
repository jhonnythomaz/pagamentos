
export enum AccountCategory {
  RECURRING = 'recurring',
  NON_RECURRING = 'non_recurring',
}

export enum TransactionStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string format
  category: string;
  accountType: AccountCategory;
  status: TransactionStatus; // All transactions are expenses, so status is mandatory
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
  ACCOUNTS_DUE = 'accounts_due',
  CALENDAR = 'calendar',
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};
