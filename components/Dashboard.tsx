import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; amount: number; color: string; }> = ({ title, amount, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>
            {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        let income = 0;
        let expenses = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        transactions.forEach(t => {
            if (new Date(t.date) >= thirtyDaysAgo) {
                if (t.type === TransactionType.INCOME) {
                    income += t.amount;
                } else {
                    expenses += t.amount;
                }
            }
        });
        return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }, [transactions]);
    
    const cashFlowData = useMemo(() => {
        const sorted = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentBalance = 0;
        const data = sorted.map(t => {
            currentBalance += t.type === TransactionType.INCOME ? t.amount : -t.amount;
            return {
                date: new Date(t.date).toLocaleDateString('pt-BR'),
                balance: currentBalance,
            }
        });
        return data;
    }, [transactions]);
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Receita (Últimos 30 Dias)" amount={totalIncome} color="text-success" />
                <StatCard title="Despesas (Últimos 30 Dias)" amount={totalExpenses} color="text-danger" />
                <StatCard title="Saldo (Últimos 30 Dias)" amount={balance} color={balance >= 0 ? 'text-gray-800' : 'text-danger'} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Fluxo de Caixa ao Longo do Tempo</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <Area type="monotone" dataKey="balance" stroke="#1e40af" fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;