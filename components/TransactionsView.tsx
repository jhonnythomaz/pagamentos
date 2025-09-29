import React, { useState } from 'react';
import { Transaction, TransactionType, NewTransaction } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';
import TransactionModal from './TransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: string[];
  onSave: (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => void;
  onDelete: (id: string) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; }> = ({ transaction, onEdit, onDelete }) => {
    const amountColor = transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600';
    const sign = transaction.type === TransactionType.INCOME ? '+' : '-';
    const formattedAmount = transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-100">
            <td className="py-3 px-6 text-left">{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
            <td className="py-3 px-6 text-left">{transaction.description}</td>
            <td className="py-3 px-6 text-left"><span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{transaction.category}</span></td>
            <td className={`py-3 px-6 text-right font-semibold ${amountColor}`}>{sign} R$ {formattedAmount}</td>
            <td className="py-3 px-6 text-center">{transaction.installments ? `${transaction.installments.current}/${transaction.installments.total}` : 'N/A'}</td>
            <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center gap-4">
                    <button onClick={() => onEdit(transaction)} className="w-6 h-6 rounded-full text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(transaction.id)} className="w-6 h-6 rounded-full text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
    );
};

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, categories, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

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
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Transações</h1>
                <button onClick={() => handleOpenModal(null)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                    <PlusIcon />
                    Nova Transação
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {transactions.map(transaction => (
                                <TransactionRow key={transaction.id} transaction={transaction} onEdit={handleOpenModal} onDelete={onDelete} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {transactions.length === 0 && <p className="text-center text-gray-500 mt-8">Nenhuma transação encontrada.</p>}
            
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