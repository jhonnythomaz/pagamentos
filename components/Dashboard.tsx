import React, { useMemo } from 'react';
import { Transaction, TransactionStatus, View } from '../types';
import { ExclamationCircleIcon, ClockIcon, CheckCircleIcon } from './Icons';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (filters: any) => void;
  setView: (view: View) => void;
}

// FIX: Correctly typed the icon prop to be a React.ReactElement that accepts a className.
// This allows passing the className prop via React.cloneElement and resolves the TypeScript error.
const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactElement<{ className?: string }>; color: string; onClick?: () => void; }> = ({ title, amount, icon, color, onClick }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-xl shadow-card ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all' : ''}`}>
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <h3 className="text-base font-medium text-slate-500">{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${color}`}>
                    {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('danger', 'danger/light').replace('warning', 'warning/light').replace('success', 'success/light')}`}>
                 {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
            </div>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate, setView }) => {
    const { overdueTotal, upcomingTotal, paidThisMonthTotal, nextDueTransactions } = useMemo(() => {
        let overdue = 0;
        let upcoming = 0;
        let paidThisMonth = 0;
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date();
        today.setHours(0,0,0,0);

        const pending = transactions
            .filter(t => t.status === TransactionStatus.PENDING)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        pending.forEach(t => {
            if (new Date(t.date) < today) {
                overdue += t.amount;
            } else {
                upcoming += t.amount;
            }
        });
        
        transactions.forEach(t => {
            if (t.status === TransactionStatus.PAID && new Date(t.date) >= startOfMonth) {
                paidThisMonth += t.amount;
            }
        });

        const nextDue = pending.filter(t => new Date(t.date) >= today).slice(0, 5);

        return { 
            overdueTotal: overdue, 
            upcomingTotal: upcoming, 
            paidThisMonthTotal: paidThisMonth,
            nextDueTransactions: nextDue
        };
    }, [transactions]);
    
    const currencyFormatter = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const handleOverdueClick = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterdayISO = new Date(today.getTime() - 1).toISOString().split('T')[0];
        onNavigate({
            status: TransactionStatus.PENDING,
            endDate: yesterdayISO,
        });
    };

    const handleUpcomingClick = () => {
        const todayISO = new Date().toISOString().split('T')[0];
        onNavigate({
            status: TransactionStatus.PENDING,
            startDate: todayISO,
        });
    };

    const handlePaidClick = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        onNavigate({
            status: TransactionStatus.PAID,
            startDate: startOfMonth,
            endDate: endOfMonth,
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Painel de Controle</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Pagamentos Vencidos" amount={overdueTotal} color="text-danger" icon={<ExclamationCircleIcon />} onClick={handleOverdueClick} />
                <StatCard title="Contas a Vencer" amount={upcomingTotal} color="text-warning" icon={<ClockIcon />} onClick={handleUpcomingClick} />
                <StatCard title="Pago (Mês Atual)" amount={paidThisMonthTotal} color="text-success" icon={<CheckCircleIcon />} onClick={handlePaidClick} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Próximos Vencimentos</h2>
                     <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); setView(View.ACCOUNTS_DUE); }} 
                        className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                        Ver todos &rarr;
                    </a>
                </div>
                {nextDueTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <tbody>
                                {nextDueTransactions.map((t, index) => (
                                    <tr key={t.id} className={index !== nextDueTransactions.length - 1 ? "border-b border-slate-200" : ""}>
                                        <td className="py-3 pr-4">
                                            <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
                                            <p className="text-sm text-slate-500 truncate">{t.category}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <p className="text-sm font-semibold text-slate-800">{currencyFormatter(t.amount)}</p>
                                            <p className="text-sm text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                     <div className="text-center text-slate-500 py-8">
                        <p>Não há contas a vencer nos próximos dias.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;