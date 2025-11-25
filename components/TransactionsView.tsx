// components/TransactionsView.tsx
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionStatus, AccountType, TransactionCategory } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, DownloadIcon } from './Icons';

interface TransactionsViewProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction | null) => void;
  onDelete: (id: string) => Promise<void>;
}

const categories: TransactionCategory[] = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Impostos', 'Eletrônicos', 'Outros'];

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onEditTransaction, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || t.status === statusFilter;
      const accountTypeMatch = accountTypeFilter === 'all' || t.accountType === accountTypeFilter;
      const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;
      return searchMatch && statusMatch && accountTypeMatch && categoryMatch;
    });
  }, [transactions, searchTerm, statusFilter, accountTypeFilter, categoryFilter]);
  
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await onDelete(id);
    }
  };
  
  const currencyFormatter = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dateFormatter = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const getStatusChip = (status: 'Pago' | 'Pendente') => {
      const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
      if (status === 'Pago') {
          return <span className={`${baseClasses} bg-success/20 text-success`}>Pago</span>
      }
      return <span className={`${baseClasses} bg-warning/20 text-yellow-800`}>Pendente</span>
  }
  
  const handleExportCSV = () => {
        const headers = ["Data do Pagamento", "Descrição", "Categoria", "Tipo de Conta", "Valor", "Status", "Parcela", "Data de Vencimento"];
        const rows = transactions.map(t => [
            dateFormatter(t.date),
            `"${t.description.replace(/"/g, '""')}"`,
            t.category,
            t.accountType,
            t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            t.status,
            t.installments || '',
            dateFormatter(t.dueDate)
        ].join(';'));

        const csvContent = `${headers.join(';')}\n${rows.join('\n')}`;
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `transacoes.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  };

  const selectStyles = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Meus Pagamentos</h1>
        <div className="flex w-full sm:w-auto items-center gap-2">
            <button
                onClick={handleExportCSV}
                className="bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shrink-0 shadow-sm"
            >
                <DownloadIcon />
            </button>
            <button
                onClick={() => onEditTransaction(null)}
                className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 shrink-0 shadow-sm"
            >
                <PlusIcon />
                Novo
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative md:col-span-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition"
                />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className={selectStyles}>
                <option value="all">Todo Status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
            </select>
            <select value={accountTypeFilter} onChange={e => { setAccountTypeFilter(e.target.value); setCurrentPage(1); }} className={selectStyles}>
                <option value="all">Todo Tipo</option>
                <option value="Recorrente">Recorrente</option>
                <option value="Não Recorrente">Não Recorrente</option>
            </select>
             <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className={selectStyles}>
                <option value="all">Toda Categoria</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">Descrição</th>
                <th scope="col" className="px-6 py-3">Valor</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Vencimento</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3">Parcela</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t) => (
                <tr key={t.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div>{t.description}</div>
                    <div className="text-xs text-slate-500">{t.category}</div>
                  </td>
                  <td className={`px-6 py-4 font-semibold text-danger`}>
                    {currencyFormatter(t.amount)}
                  </td>
                  <td className="px-6 py-4">{getStatusChip(t.status)}</td>
                  <td className="px-6 py-4">{dateFormatter(t.dueDate)}</td>
                  <td className="px-6 py-4">{t.accountType}</td>
                  <td className="px-6 py-4">{t.installments || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onEditTransaction(t)} className="text-primary hover:text-primary-hover mr-4"><PencilIcon /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-danger hover:text-danger-hover"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
            <div className="text-center py-16 text-slate-500">
                 <p>Nenhum pagamento encontrado para os filtros selecionados.</p>
            </div>
        )}
        {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
                <span className="text-sm text-slate-700">
                    Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Anterior
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Próxima
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;