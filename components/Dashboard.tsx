import React, { useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; amount: number; color: string; }> = ({ title, amount, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>
            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
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
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Painel de Controle</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Pagamentos Vencidos" amount={overdueTotal} color="text-danger" />
                <StatCard title="Contas a Vencer" amount={upcomingTotal} color="text-warning" />
                <StatCard title="Pago (Mês Atual)" amount={paidThisMonthTotal} color="text-success" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Próximos Vencimentos</h2>
                {nextDueTransactions.length > 0 ? (
                    <div className="flow-root">
                        <ul role="list" className="-my-5 divide-y divide-slate-200">
                            {nextDueTransactions.map(t => (
                                <li key={t.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                                            <p className="text-sm text-slate-500 truncate">{t.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900">{currencyFormatter(t.amount)}</p>
                                            <p className="text-sm text-slate-500">Vence em: {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
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