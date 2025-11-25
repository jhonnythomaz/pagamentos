// components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionCategory, TransactionStatus, AccountType, NewTransaction } from '../types';
import { CloseIcon } from './Icons';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (transactionData: Transaction | NewTransaction, isNew: boolean) => void;
}

const categories: TransactionCategory[] = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Impostos', 'Eletrônicos', 'Outros'];
const statuses: TransactionStatus[] = ['Pendente', 'Pago'];
const accountTypes: AccountType[] = ['Recorrente', 'Não Recorrente'];

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose, onSave }) => {
    const getInitialFormData = () => {
        const today = new Date().toISOString().split('T')[0];
        return {
            description: '',
            amount: 0,
            date: today, // Data de Pagamento
            dueDate: today, // Data de Vencimento
            category: 'Outros' as TransactionCategory,
            status: 'Pendente' as TransactionStatus,
            accountType: 'Não Recorrente' as AccountType,
            installments: '',
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const isNew = !transaction;

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                dueDate: transaction.dueDate,
                category: transaction.category,
                status: transaction.status,
                accountType: transaction.accountType,
                installments: transaction.installments || '',
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [transaction]);
    
    // Efeito para ajustar a data de pagamento quando o status muda para "Pago"
    useEffect(() => {
        // Se o status for alterado para 'Pago' E (é uma nova transação OU a transação existente era 'Pendente')
        if (formData.status === 'Pago' && (isNew || (transaction && transaction.status === 'Pendente'))) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, date: today }));
        }
    }, [formData.status, isNew, transaction]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.description.trim() === '' || formData.amount <= 0) {
            alert('Descrição e valor são obrigatórios e o valor deve ser maior que zero.');
            return;
        }

        const transactionData = {
            ...formData,
            installments: formData.accountType === 'Não Recorrente' ? formData.installments : undefined,
        };

        if (isNew) {
            onSave(transactionData, true);
        } else {
            onSave({ ...transactionData, id: transaction!.id }, false);
        }
    };

    const inputStyles = "block w-full border border-slate-300 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition";
    const labelStyles = "block text-sm font-medium text-slate-700 mb-1";
    const disabledTextStyles = "block w-full bg-slate-100 rounded-lg py-2.5 px-3 text-slate-500 border border-slate-200";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isNew ? 'Adicionar Novo Pagamento' : 'Editar Pagamento'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="description" className={labelStyles}>Descrição</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className={inputStyles} required />
                        </div>

                        <div>
                            <label htmlFor="amount" className={labelStyles}>Valor (R$)</label>
                            <input type="number" name="amount" id="amount" value={formData.amount === 0 ? '' : formData.amount} onChange={handleChange} className={inputStyles} required step="0.01" min="0.01" placeholder="0,00" />
                        </div>
                        
                        <div>
                            <label htmlFor="category" className={labelStyles}>Categoria</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className={inputStyles}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="status" className={labelStyles}>Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        
                        {formData.status === 'Pendente' && (
                            <div>
                                <label htmlFor="dueDate" className={labelStyles}>Data de Vencimento</label>
                                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className={inputStyles} required />
                            </div>
                        )}

                        {formData.status === 'Pago' && (
                            <>
                                <div>
                                    <label htmlFor="date" className={labelStyles}>Data de Pagamento</label>
                                    <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={inputStyles} required />
                                </div>
                                <div>
                                    <label className={labelStyles}>Vencimento Original</label>
                                    <p className={disabledTextStyles}>
                                        {new Date(transaction?.dueDate ?? formData.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </p>
                                </div>
                            </>
                        )}
                        
                        <div className={formData.status === 'Pago' ? 'md:col-span-2' : ''}>
                            <label htmlFor="accountType" className={labelStyles}>Tipo de Conta</label>
                            <select name="accountType" id="accountType" value={formData.accountType} onChange={handleChange} className={inputStyles}>
                                {accountTypes.map(at => <option key={at} value={at}>{at}</option>)}
                            </select>
                        </div>

                        {formData.accountType === 'Não Recorrente' && (
                            <div className="md:col-span-2">
                                <label htmlFor="installments" className={labelStyles}>Parcelas (ex: 1/3)</label>
                                <input type="text" name="installments" id="installments" value={formData.installments} onChange={handleChange} className={inputStyles} placeholder="Ex: 1/3" />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                            {isNew ? 'Adicionar' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;