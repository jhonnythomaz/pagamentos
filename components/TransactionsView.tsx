import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, NewTransaction, AccountCategory, TransactionStatus } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, DownloadIcon, SearchIcon, ClipboardListIcon } from './Icons';
import TransactionModal from './TransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: string[];
  onSave: (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => void;
  onDelete: (id: string) => void;
  initialFilters?: any | null;
  onInitialFiltersApplied?: () => void;
}

const ITEMS_PER_PAGE = 10;

const StatusIndicator: React.FC<{ status: TransactionStatus }> = ({ status }) => {
    const statusConfig = {
        [TransactionStatus.PAID]: { label: 'Pago', color: 'bg-success' },
        [TransactionStatus.PENDING]: { label: 'Pendente', color: 'bg-warning' },
    };
    const { label, color } = statusConfig[status] || { label: 'N/A', color: 'bg-slate-400' };

    return (
        <div className="flex items-center justify-center">
            <span className={`h-2 w-2 rounded-full ${color} mr-2`}></span>
            <span className="text-sm text-slate-700">{label}</span>
        </div>
    );
};

const TransactionRow: React.FC<{ transaction: Transaction; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; }> = ({ transaction, onEdit, onDelete }) => {
    const formattedAmount = transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const accountTypeLabel = transaction.accountType === AccountCategory.RECURRING ? 'Recorrente' : 'Não Recorrente';
    
    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50/50">
            <td className="py-4 px-6 text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
            <td className="py-4 px-6 text-sm font-medium text-slate-800">{transaction.description}</td>
            <td className="py-4 px-6 text-sm text-slate-600">{transaction.category}</td>
            <td className="py-4 px-6 text-sm text-center text-slate-600">{accountTypeLabel}</td>
            <td className={`py-4 px-6 text-sm text-right font-semibold text-slate-800`}>- R$ {formattedAmount}</td>
            <td className="py-4 px-6 text-sm text-center">
                <StatusIndicator status={transaction.status} />
            </td>
            <td className="py-4 px-6 text-sm text-center text-slate-600">{transaction.installments ? `${transaction.installments.current}/${transaction.installments.total}` : '-'}</td>
            <td className="py-4 px-6 text-center">
                <div className="flex item-center justify-center gap-2">
                    <button onClick={() => onEdit(transaction)} className="text-slate-500 hover:text-primary transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(transaction.id)} className="text-slate-500 hover:text-danger transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, categories, onSave, onDelete, initialFilters, onInitialFiltersApplied }) => {
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
    const [currentPage, setCurrentPage] = useState(1);
    
     useEffect(() => {
        if (initialFilters) {
            const defaultFilters = {
                description: '',
                category: 'all',
                accountType: 'all',
                status: 'all',
                startDate: '',
                endDate: '',
            };
            setFilters({ ...defaultFilters, ...initialFilters });
            setCurrentPage(1);
            if (onInitialFiltersApplied) {
                onInitialFiltersApplied();
            }
        }
    }, [initialFilters, onInitialFiltersApplied]);

    const inputStyles = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition";

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
        setCurrentPage(1);
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
        setCurrentPage(1);
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

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, endIndex);
    }, [filteredTransactions, currentPage]);
    
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };


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
                <button onClick={() => handleOpenModal(null)} className="bg-primary text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                    <PlusIcon />
                    Novo Pagamento
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
                 <h3 className="text-base font-medium text-slate-500">Despesas no Período</h3>
                 <p className="text-3xl font-bold mt-2 text-danger">
                     {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
             </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
                    <h3 className="text-lg font-semibold text-slate-800">Filtrar Pagamentos</h3>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <button onClick={handleClearFilters} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Limpar Filtros</button>
                        <button onClick={handleExportCSV} className="bg-slate-700 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                            <DownloadIcon className="w-4 h-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="col-span-1 md:col-span-2 lg:col-span-5">
                        <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
                        <input type="text" name="description" id="description" value={filters.description} onChange={handleFilterChange} className={inputStyles} placeholder="Ex: Conta de Luz, Aluguel..."/>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                        <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todas</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="accountType" className="block text-sm font-medium text-slate-600 mb-1">Tipo de Conta</label>
                        <select name="accountType" id="accountType" value={filters.accountType} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todos</option>
                            <option value={AccountCategory.RECURRING}>Recorrente</option>
                            <option value={AccountCategory.NON_RECURRING}>Não Recorrente</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="status" className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                        <select name="status" id="status" value={filters.status} onChange={handleFilterChange} className={inputStyles}>
                            <option value="all">Todos</option>
                            <option value={TransactionStatus.PAID}>Pago</option>
                            <option value={TransactionStatus.PENDING}>Pendente</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-1">Data Início</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputStyles} />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-600 mb-1">Data Fim</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputStyles} />
                    </div>
                </div>
            </div>

            {filteredTransactions.length > 0 ? (
                <>
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                                    <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                    <th className="py-3 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcelas</th>
                                    <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedTransactions.map(transaction => (
                                    <TransactionRow key={transaction.id} transaction={transaction} onEdit={handleOpenModal} onDelete={onDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-6">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Anterior
                    </button>
                    <span className="text-sm text-slate-500">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Próxima
                    </button>
                </div>
                </>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-card">
                    {transactions.length > 0 ? (
                        <>
                            <SearchIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhum Resultado Encontrado</h3>
                            <p className="mt-2 text-sm text-slate-500">Tente ajustar seus filtros para encontrar o que procura.</p>
                        </>
                    ) : (
                         <>
                            <ClipboardListIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhum Pagamento Adicionado</h3>
                            <p className="mt-2 text-sm text-slate-500">Comece adicionando seu primeiro pagamento para vê-lo aqui.</p>
                         </>
                    )}
                </div>
            )}
            
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