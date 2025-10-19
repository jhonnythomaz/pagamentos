import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadIcon } from './Icons';

interface ReportsViewProps {
  transactions: Transaction[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        transactions.forEach(t => {
            const date = new Date(t.date);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            periods.add(period);
        });
        return Array.from(periods).sort((a, b) => b.localeCompare(a));
    }, [transactions]);

    const formatPeriodForDisplay = (period: string) => {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    };

    const filteredTransactions = useMemo(() => {
        if (selectedPeriod === 'all') {
            return transactions;
        }
        const [year, month] = selectedPeriod.split('-').map(Number);
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });
    }, [transactions, selectedPeriod]);

    const monthlyData = useMemo(() => {
        const data: { [key: string]: { name: string, despesa: number, sortKey: string } } = {};
        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!data[month]) {
                data[month] = { name: month, despesa: 0, sortKey: sortKey };
            }
            data[month].despesa += t.amount;
        });
        return Object.values(data).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filteredTransactions]);

    const expenseByCategoryData = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredTransactions.forEach(t => {
            if (!data[t.category]) {
                data[t.category] = 0;
            }
            data[t.category] += t.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [filteredTransactions]);
    
    const COLORS = ['hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)', 'hsl(142, 69%, 45%)', 'hsl(0, 72%, 51%)', '#9333ea', '#db2777'];
    const currencyFormatter = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const handleExportCSV = () => {
        if (monthlyData.length === 0 && expenseByCategoryData.length === 0) {
            alert("Não há dados de relatório para exportar.");
            return;
        }

        let csvContent = "";
        csvContent += "Despesas Mensais\n";
        csvContent += "Mês,Despesa\n";
        monthlyData.forEach(row => {
            csvContent += `"${row.name}",${row.despesa}\n`;
        });
        csvContent += "\n";
        csvContent += "Despesas por Categoria\n";
        csvContent += "Categoria,Valor\n";
        expenseByCategoryData.forEach(row => {
            csvContent += `"${row.name.replace(/"/g, '""')}",${row.value}\n`;
        });

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_pagamentos_${selectedPeriod}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputStyles = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition";

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Relatórios de Pagamentos</h1>
                <div className="flex items-center gap-4">
                    <div>
                        <label htmlFor="period-filter" className="sr-only">Filtrar por Período</label>
                        <select 
                            id="period-filter"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className={inputStyles}
                        >
                            <option value="all">Todo o Período</option>
                            {availablePeriods.map(period => (
                                <option key={period} value={period}>
                                    {formatPeriodForDisplay(period)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleExportCSV} 
                        className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                    >
                        <DownloadIcon />
                        Exportar
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <h2 className="text-xl font-semibold text-slate-700 mb-6">Despesas Mensais</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(tick) => tick.toLocaleString('pt-BR')} />
                            <Tooltip formatter={currencyFormatter} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                            <Legend wrapperStyle={{fontSize: "14px", paddingTop: '20px'}}/>
                            <Bar dataKey="despesa" name="Despesa" fill={'hsl(0, 72%, 51%)'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-card">
                    <h2 className="text-xl font-semibold text-slate-700 mb-6">Despesas por Categoria</h2>
                     {expenseByCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseByCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(typeof percent === 'number' ? percent * 100 : 0).toFixed(0)}%`}
                                >
                                    {expenseByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={currencyFormatter} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                                <Legend wrapperStyle={{fontSize: "14px", paddingTop: '20px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-[300px] text-slate-500">
                             Nenhum dado de despesa para exibir no período selecionado.
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsView;