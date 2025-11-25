
// types.ts
export type TransactionCategory = string;
export type TransactionStatus = 'Pago' | 'Pendente';
export type AccountType = 'Recorrente' | 'Não Recorrente';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Nota: Em um app real, nunca armazene senhas em texto puro no frontend/localStorage.
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // Data da transação/pagamento
  dueDate: string; // Data de vencimento
  category: TransactionCategory;
  status: TransactionStatus;
  accountType: AccountType;
  installments?: string; // Ex: "1/3"
}

export interface NewTransaction {
    description: string;
    amount: number;
    date: string;
    dueDate: string;
    category: TransactionCategory;
    status: TransactionStatus;
    accountType: AccountType;
    installments?: string;
}


export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
