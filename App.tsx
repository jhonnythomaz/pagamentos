import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, NewTransaction, View, TransactionStatus } from './types';
import * as api from './services/api';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import AccountsDueView from './components/AccountsDueView';
import { DashboardIcon, TransactionsIcon, ReportsIcon, CalendarIcon } from './components/Icons';

const Sidebar: React.FC<{ activeView: View; setView: (view: View) => void }> = ({ activeView, setView }) => {
    const navItems = [
        { id: View.DASHBOARD, label: 'Painel', icon: <DashboardIcon /> },
        { id: View.TRANSACTIONS, label: 'Pagamentos', icon: <TransactionsIcon /> },
        { id: View.ACCOUNTS_DUE, label: 'Contas a Vencer', icon: <CalendarIcon /> },
        { id: View.REPORTS, label: 'Relatórios', icon: <ReportsIcon /> },
    ];

    return (
        <aside className="w-64 bg-slate-800 text-slate-200 flex flex-col">
            <div className="p-6 text-2xl font-bold text-white">
                Pagamentos
            </div>
            <nav className="flex-1 px-4 py-2">
                <ul>
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setView(item.id); }}
                                className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-colors ${
                                    activeView === item.id 
                                        ? 'bg-primary text-white' 
                                        : 'hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                                <span className="font-medium text-sm">{item.label}</span>
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSaveTransaction = async (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => {
        try {
            if ('id' in transaction) {
                await api.updateTransaction(transaction.id, transaction);
            } else {
                await api.addTransaction(transaction);
            }
            fetchData();
        } catch (err) {
            setError('Falha ao salvar pagamento.');
        }
    };
    
    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Você tem certeza que quer deletar este pagamento?')) {
            try {
                await api.deleteTransaction(id);
                fetchData();
            } catch (err) {
                setError('Falha ao deletar pagamento.');
            }
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            await api.updateTransaction(id, { status: TransactionStatus.PAID });
            fetchData();
        } catch (err) {
            setError('Falha ao marcar a conta como paga.');
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><p className="text-xl text-slate-500">Carregando...</p></div>;
        if (error) return <div className="flex justify-center items-center h-full"><p className="text-xl text-danger">{error}</p></div>;

        switch (view) {
            case View.DASHBOARD:
                return <Dashboard transactions={transactions} />;
            case View.TRANSACTIONS:
                return <TransactionsView transactions={transactions} categories={categories} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} />;
            case View.REPORTS:
                return <ReportsView transactions={transactions} />;
            case View.ACCOUNTS_DUE:
                return <AccountsDueView transactions={transactions} onMarkAsPaid={handleMarkAsPaid} />;
            default:
                return <Dashboard transactions={transactions} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar activeView={view} setView={setView} />
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;