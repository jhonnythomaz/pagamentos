import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, NewTransaction, View, TransactionStatus } from './types';
import * as api from './services/api';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import AccountsDueView from './components/AccountsDueView';
import { DashboardIcon, TransactionsIcon, ReportsIcon, CalendarIcon, LogoIcon } from './components/Icons';

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
        { id: View.ACCOUNTS_DUE, label: 'Contas a Vencer', icon: <CalendarIcon /> },
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
        if (error) return <div className="flex justify-center items-center h-full"><p className="text-xl text-danger">{error}</p></div>;

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
        </div>
    );
};

export default App;