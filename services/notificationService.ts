import { Transaction, TransactionStatus } from '../types';

const NOTIFIED_PAYMENTS_KEY = 'notifiedPayments';

// Helper to get notified payments from localStorage
const getNotifiedPayments = (): { [id: string]: 'upcoming' | 'overdue' } => {
    try {
        const stored = localStorage.getItem(NOTIFIED_PAYMENTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to parse notified payments from localStorage", error);
        return {};
    }
};

// Helper to save notified payments to localStorage
const setNotifiedPayments = (notified: { [id: string]: 'upcoming' | 'overdue' }) => {
    try {
        localStorage.setItem(NOTIFIED_PAYMENTS_KEY, JSON.stringify(notified));
    } catch (error) {
        console.error("Failed to save notified payments to localStorage", error);
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('Este navegador não suporta notificações.');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    // We only ask for permission if it's not denied
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

const sendNotification = (title: string, options: NotificationOptions) => {
    new Notification(title, options);
};

export const checkAndSendNotifications = (transactions: Transaction[]) => {
    if (Notification.permission !== 'granted') {
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingLimit = new Date();
    upcomingLimit.setDate(today.getDate() + 3);
    upcomingLimit.setHours(23, 59, 59, 999);

    const notifiedPayments = getNotifiedPayments();

    transactions
        .filter(t => t.status === TransactionStatus.PENDING)
        .forEach(t => {
            const dueDate = new Date(t.date);
            const notificationId = t.id;

            // Check if it's overdue
            if (dueDate < today) {
                if (notifiedPayments[notificationId] !== 'overdue') {
                    sendNotification('Pagamento Vencido!', {
                        body: `Sua conta "${t.description}" de ${t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} venceu.`,
                        icon: '/favicon.ico',
                    });
                    notifiedPayments[notificationId] = 'overdue';
                }
            }
            // Check if it's upcoming
            else if (dueDate >= today && dueDate <= upcomingLimit) {
                if (notifiedPayments[notificationId] !== 'upcoming') {
                     sendNotification('Alerta de Vencimento', {
                        body: `Sua conta "${t.description}" de ${t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} vence em breve.`,
                        icon: '/favicon.ico',
                    });
                    notifiedPayments[notificationId] = 'upcoming';
                }
            }
        });
    
    setNotifiedPayments(notifiedPayments);
};

export const clearNotificationStatus = (transactionId: string) => {
    const notifiedPayments = getNotifiedPayments();
    if (notifiedPayments[transactionId]) {
        delete notifiedPayments[transactionId];
        setNotifiedPayments(notifiedPayments);
    }
};
