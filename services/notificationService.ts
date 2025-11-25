// services/notificationService.ts
import { ToastMessage, ToastType, Transaction } from '../types';

type Listener = (messages: ToastMessage[]) => void;

let listeners: Listener[] = [];
let messages: ToastMessage[] = [];
let nextId = 0;

const notificationService = {
  subscribe(listener: Listener): () => void {
    listeners.push(listener);
    listener(messages); // Immediately notify with current messages
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  add(message: string, type: ToastType) {
    const newMessage: ToastMessage = {
      id: nextId++,
      message,
      type,
    };
    messages = [newMessage, ...messages];
    this.notify();
  },

  dismiss(id: number) {
    messages = messages.filter(m => m.id !== id);
    this.notify();
  },

  notify() {
    for (const listener of listeners) {
      listener(messages);
    }
  },

  checkDueTransactions(transactions: Transaction[]) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const overdue = transactions.filter(t => {
          const dueDate = new Date(t.dueDate);
          return t.status === 'Pendente' && dueDate < today;
      });

      if (overdue.length > 0) {
          const message = overdue.length === 1
              ? `Você tem 1 conta vencida: ${overdue[0].description}.`
              : `Você tem ${overdue.length} contas vencidas.`;
          
          // Avoid creating duplicate notifications
          if (!messages.some(m => m.message.startsWith('Você tem') && m.type === 'error')) {
            this.add(message, 'error');
          }
      }
      
      const dueToday = transactions.filter(t => {
        const dueDate = new Date(t.dueDate);
        return t.status === 'Pendente' && dueDate.toDateString() === today.toDateString();
      });

      if (dueToday.length > 0) {
        const message = `Você tem ${dueToday.length} conta(s) vencendo hoje.`;
        if (!messages.some(m => m.message.includes('vencendo hoje') && m.type === 'info')) {
            this.add(message, 'info');
          }
      }
  }
};

export const notify = {
    success: (message: string) => notificationService.add(message, 'success'),
    error: (message: string) => notificationService.add(message, 'error'),
    info: (message: string) => notificationService.add(message, 'info'),
};


export default notificationService;
