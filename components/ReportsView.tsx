import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsViewProps {
  transactions: Transaction[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {

    const monthlyData = useMemo(() => {
        const data: { [key: string]: { name: string, receita: number, despesa: number, sortKey: string } } = {};
        transactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!data[month]) {
                data[month] = { name: month, receita: 0, despesa: 0, sortKey: sortKey };
            }
            if (t.type === TransactionType.INCOME) {
                data[month].receita += t.amount;
            } else {
                data[month].despesa += t.amount;
            }
        });
        return Object.values(data).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [transactions]);

    const expenseByCategoryData = useMemo(() => {
        const data: { [key: string]: number } = {};
        transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .forEach(t => {
                if (!data[t.category]) {
                    data[t.category] = 0;
                }
                data[t.category] += t.amount;
            });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [transactions]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
    const currencyFormatter = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Relatórios Financeiros</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Receita vs. Despesa Mensal</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(tick) => tick.toLocaleString('pt-BR')} />
                            <Tooltip formatter={currencyFormatter} />
                            <Legend />
                            <Bar dataKey="receita" name="Receita" fill="#16a34a" />
                            <Bar dataKey="despesa" name="Despesa" fill="#dc2626" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Despesas por Categoria</h2>
                     {expenseByCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseByCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {expenseByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={currencyFormatter}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-full text-gray-500">
                             Nenhum dado de despesa para exibir.
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsView;