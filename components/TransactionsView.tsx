import React, { useState, useMemo } from 'react';
import { Transaction, NewTransaction, AccountCategory, TransactionStatus } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, DownloadIcon } from './Icons';
import TransactionModal from './TransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: string[];
  onSave: (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => void;
  onDelete: (id: string) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; }> = ({ transaction, onEdit, onDelete }) => {
    const formattedAmount = transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const accountTypeLabel = transaction.accountType === AccountCategory.RECURRING ? 'Recorrente' : 'Não Recorrente';
    
    const statusLabel = transaction.status === TransactionStatus.PENDING ? 'Pendente' : 'Pago';
    const statusColor = transaction.status === TransactionStatus.PENDING 
        ? 'bg-amber-100 text-amber-800' 
        : 'bg-emerald-100 text-emerald-800';


    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="py-4 px-6 text-sm text-slate-700">{new Date(transaction.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
            <td className="py-4 px-6 text-sm font-medium text-slate-900">{transaction.description}</td>
            <td className="py-4 px-6 text-sm text-slate-700">{transaction.category}</td>
            <td className="py-4 px-6 text-sm text-center text-slate-700">{accountTypeLabel}</td>
            <td className={`py-4 px-6 text-sm text-right font-semibold text-slate-800`}>- R$ {formattedAmount}</td>
            <td className="py-4 px-6 text-sm text-center">
                 <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
            </td>
            <td className="py-4 px-6 text-sm text-center text-slate-700">{transaction.installments ? `${transaction.installments.current}/${transaction.installments.total}` : '-'}</td>
            <td className="py-4 px-6 text-center">
                <div className="flex item-center justify-center gap-2">
                    <button onClick={() => onEdit(transaction)} className="text-slate-500 hover:text-primary transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(transaction.id)} className="text-slate-500 hover:text-danger transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, categories, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState({
        description: '',
        category: 'all',
        accountType: 'all',
        status: 'all',
        startDate: '',
        endDate: '',
    });
    
    const inputStyles = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

    const handleOpenModal = (transaction: Transaction | null) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(false);
    };
    
    const handleSave = (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => {
        onSave(transaction);
        handleCloseModal();
    }
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            description: '',
            category: 'all',
            accountType: 'all',
            status: 'all',
            startDate: '',
            endDate: '',
        });
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const descriptionMatch = !filters.description || transaction.description.toLowerCase().includes(filters.description.toLowerCase());
            const categoryMatch = filters.category === 'all' || transaction.category === filters.category;
            const accountTypeMatch = filters.accountType === 'all' || transaction.accountType === filters.accountType;
            const statusMatch = filters.status === 'all' || transaction.status === filters.status;
            
            const transactionDate = transaction.date.substring(0, 10);
            const startDateMatch = !filters.startDate || transactionDate >= filters.startDate;
            const endDateMatch = !filters.endDate || transactionDate <= filters.endDate;

            return descriptionMatch && categoryMatch && accountTypeMatch && statusMatch && startDateMatch && endDateMatch;
        });
    }, [transactions, filters]);

    const totalExpenses = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
    }, [filteredTransactions]);
    
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert("Não há pagamentos para exportar com os filtros atuais.");
            return;
        }

        const headers = ["Data", "Descrição", "Categoria", "Tipo de Conta", "Valor", "Status", "Parcela"];
        let csvContent = headers.join(",") + "\n";

        filteredTransactions.forEach(t => {
            const row = [
                new Date(t.date).toLocaleDateString('pt-BR'),
                `"${t.description.replace(/"/g, '""')}"`,
                t.category,
                t.accountType === AccountCategory.RECURRING ? 'Recorrente' : 'Não Recorrente',
                t.amount.toLocaleString('pt-BR', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2}),
                t.status === TransactionStatus.PENDING ? 'Pendente' : 'Pago',
                t.installments ? `${t.installments.current}/${t.installments.total}` : ''
            ];
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "pagamentos_filtrados.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Pagamentos</h1>
                <button onClick={() => handleOpenModal(null)} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 shrink-0 shadow-sm">
                    <PlusIcon />
                    Novo Pagamento
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Despesas no Período</h3>
                    <p className="text-3xl font-bold mt-2 text-danger">
                        {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                        <label htmlFor="description" className="block text-sm font-medium text-slate-600">Descrição</label>
                        <input type="text" name="description" id="description" value={filters.description} onChange={handleFilterChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-600">Categoria</label>
                        <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todas</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="accountType" className="block text-sm font-medium text-slate-600">Tipo de Conta</label>
                        <select name="accountType" id="accountType" value={filters.accountType} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todos</option>
                            <option value={AccountCategory.RECURRING}>Recorrente</option>
                            <option value={AccountCategory.NON_RECURRING}>Não Recorrente</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-600">Status</label>
                        <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todos</option>
                            <option value={TransactionStatus.PAID}>Pago</option>
                            <option value={TransactionStatus.PENDING}>Pendente</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Data Início</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputStyles} />
                    </div>
                    <div className="lg:col-start-2 xl:col-start-auto">
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">Data Fim</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputStyles} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5 pt-5 border-t border-slate-200">
                    <button onClick={handleClearFilters} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">Limpar Filtros</button>
                    <button onClick={handleExportCSV} className="bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <DownloadIcon />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                                <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                                <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Conta</th>
                                <th className="py-3 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcelas</th>
                                <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(transaction => (
                                <TransactionRow key={transaction.id} transaction={transaction} onEdit={handleOpenModal} onDelete={onDelete} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {transactions.length > 0 && filteredTransactions.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500">Nenhum pagamento corresponde aos filtros selecionados.</p>
                </div>
            )}
            {transactions.length === 0 && 
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500">Nenhum pagamento encontrado.</p>
                </div>
            }
            
            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                onSave={handleSave}
                transactionToEdit={transactionToEdit}
                categories={categories}
            />
        </div>
    );
};

export default TransactionsView;