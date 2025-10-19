import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, NewTransaction, View, TransactionStatus, ToastMessage } from './types';
import * as api from './services/api';
import * as notificationService from './services/notificationService';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import AccountsDueView from './components/AccountsDueView';
import CalendarView from './components/CalendarView';
import { DashboardIcon, TransactionsIcon, ReportsIcon, CalendarIcon, LogoIcon, DocumentTextIcon } from './components/Icons';
import ToastContainer from './components/ToastContainer';

export type FiltersState = {
    id?: string;
    description: string;
    category: string;
    accountType: string;
    status: string;
    startDate: string;
    endDate: string;
};

const Sidebar: React.FC<{ activeView: View; setView: (view: View) => void }> = ({ activeView, setView }) => {
    const navItems = [
        { id: View.DASHBOARD, label: 'Painel', icon: <DashboardIcon /> },
        { id: View.TRANSACTIONS, label: 'Pagamentos', icon: <TransactionsIcon /> },
        { id: View.CALENDAR, label: 'Calendário', icon: <CalendarIcon /> },
        { id: View.ACCOUNTS_DUE, label: 'Contas a Vencer', icon: <DocumentTextIcon /> },
        { id: View.REPORTS, label: 'Relatórios', icon: <ReportsIcon /> },
    ];

    return (
        <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col shrink-0">
            <div className="flex items-center gap-3 p-6 text-xl font-bold text-white border-b border-slate-700">
                <LogoIcon className="w-7 h-7 text-primary" />
                <span>Pagamentos</span>
            </div>
            <nav className="flex-1 px-4 py-4">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setView(item.id); }}
                                className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 relative ${
                                    activeView === item.id 
                                        ? 'bg-slate-700 text-white font-semibold' 
                                        : 'hover:bg-slate-700/50 hover:text-white'
                                }`}
                            >
                                {activeView === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full"></div>}
                                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                                <span className="text-sm">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialFilters, setInitialFilters] = useState<Partial<FiltersState> | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastMessage['type']) => {
        setToasts(prevToasts => [
            ...prevToasts,
            { id: Date.now(), message, type },
        ]);
    };

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [transData, catData] = await Promise.all([
                api.getTransactions(),
                api.getCategories()
            ]);
            setTransactions(transData);
            setCategories(catData.sort());
        } catch (err) {
            setError('Falha ao buscar dados. Por favor, tente novamente mais tarde.');
            addToast('Falha ao buscar dados.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Request permission as soon as the app loads.
        // It's safe to call this; it only prompts if permission is 'default'.
        notificationService.requestNotificationPermission();
    }, [fetchData]);

    useEffect(() => {
        // This effect runs whenever transactions change to check for notifications.
        if (transactions.length > 0) {
            notificationService.checkAndSendNotifications(transactions);
        }
    }, [transactions]);

    const createNextInstallment = async (paidTransaction: Transaction) => {
        if (
            paidTransaction.installments &&
            paidTransaction.installments.current < paidTransaction.installments.total
        ) {
            const nextInstallmentDate = new Date(paidTransaction.date);
            nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1);

            const nextInstallment: NewTransaction = {
                description: paidTransaction.description,
                amount: paidTransaction.amount,
                category: paidTransaction.category,
                accountType: paidTransaction.accountType,
                date: nextInstallmentDate.toISOString(),
                status: TransactionStatus.PENDING,
                installments: {
                    current: paidTransaction.installments.current + 1,
                    total: paidTransaction.installments.total,
                },
            };
            
            await api.addTransaction(nextInstallment);
            addToast(`Próxima parcela (${nextInstallment.installments.current}/${nextInstallment.installments.total}) criada.`, 'info');
        }
    };
    
    const handleSaveTransaction = async (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => {
        try {
            if ('id' in transaction) {
                const originalTransaction = transactions.find(t => t.id === transaction.id);
                await api.updateTransaction(transaction.id, transaction);
                notificationService.clearNotificationStatus(transaction.id);
                addToast('Pagamento atualizado com sucesso!', 'success');
                
                if (
                    originalTransaction &&
                    originalTransaction.status === TransactionStatus.PENDING &&
                    transaction.status === TransactionStatus.PAID
                ) {
                    await createNextInstallment({ ...originalTransaction, ...transaction } as Transaction);
                }
            } else {
                await api.addTransaction(transaction);
                addToast('Pagamento criado com sucesso!', 'success');
            }
            fetchData();
        } catch (err) {
            addToast('Falha ao salvar pagamento.', 'error');
        }
    };
    
    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Você tem certeza que quer deletar este pagamento?')) {
            try {
                await api.deleteTransaction(id);
                notificationService.clearNotificationStatus(id);
                addToast('Pagamento deletado.', 'info');
                fetchData();
            } catch (err) {
                addToast('Falha ao deletar pagamento.', 'error');
            }
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            const transactionToPay = transactions.find(t => t.id === id);
            if (!transactionToPay) throw new Error("Transaction not found");

            await api.updateTransaction(id, { status: TransactionStatus.PAID });
            notificationService.clearNotificationStatus(id);
            addToast('Conta marcada como paga!', 'success');
            
            await createNextInstallment(transactionToPay);
            
            fetchData();
        } catch (err) {
            addToast('Falha ao marcar a conta como paga.', 'error');
        }
    };

    const handleNavigateWithFilters = (filters: Partial<FiltersState>) => {
        setInitialFilters(filters);
        setView(View.TRANSACTIONS);
    };
    
    const handleSetView = (newView: View) => {
        setInitialFilters(null); // Clear filters when changing views manually
        setView(newView);
    }

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><p className="text-xl text-slate-500">Carregando...</p></div>;
        if (error && transactions.length === 0) return <div className="flex justify-center items-center h-full"><p className="text-xl text-danger">{error}</p></div>;

        switch (view) {
            case View.DASHBOARD:
                return <Dashboard transactions={transactions} onNavigate={handleNavigateWithFilters} setView={handleSetView} />;
            case View.TRANSACTIONS:
                return <TransactionsView 
                            transactions={transactions} 
                            categories={categories} 
                            onSave={handleSaveTransaction} 
                            onDelete={handleDeleteTransaction}
                            initialFilters={initialFilters}
                            onInitialFiltersApplied={() => setInitialFilters(null)}
                       />;
            case View.CALENDAR:
                return <CalendarView transactions={transactions} />;
            case View.REPORTS:
                return <ReportsView transactions={transactions} />;
            case View.ACCOUNTS_DUE:
                return <AccountsDueView transactions={transactions} onMarkAsPaid={handleMarkAsPaid} />;
            default:
                return <Dashboard transactions={transactions} onNavigate={handleNavigateWithFilters} setView={handleSetView} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <Sidebar activeView={view} setView={handleSetView} />
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
            <ToastContainer messages={toasts} onDismiss={removeToast} />
        </div>
    );
};

export default App;