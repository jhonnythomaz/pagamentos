
// components/TransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionCategory, TransactionStatus, AccountType, NewTransaction } from '../types';
import { CloseIcon } from './Icons';

interface TransactionModalProps {
  transaction: Transaction | null;
  categories: string[];
  onClose: () => void;
  onSave: (transactionData: Transaction | NewTransaction | NewTransaction[], isNew: boolean) => void;
}

const statuses: TransactionStatus[] = ['Pendente', 'Pago'];
const accountTypes: AccountType[] = ['Recorrente', 'Não Recorrente'];

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, categories, onClose, onSave }) => {
    // Helper to extract installment numbers
    const parseInstallments = (str?: string) => {
        if (!str) return { current: 1, total: 1 };
        const parts = str.split('/');
        return {
            current: parseInt(parts[0]) || 1,
            total: parseInt(parts[1]) || 1
        };
    };

    const getInitialFormData = () => {
        const today = new Date().toISOString().split('T')[0];
        return {
            description: '',
            amount: 0,
            date: today, // Data de Pagamento
            dueDate: today, // Data de Vencimento
            category: categories[0] || 'Outros',
            status: 'Pendente' as TransactionStatus,
            accountType: 'Não Recorrente' as AccountType,
            installmentCurrent: 1,
            installmentTotal: 1,
            generateFuture: false,
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const isNew = !transaction;

    useEffect(() => {
        if (transaction) {
            const { current, total } = parseInstallments(transaction.installments);
            setFormData({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                dueDate: transaction.dueDate,
                category: transaction.category,
                status: transaction.status,
                accountType: transaction.accountType,
                installmentCurrent: current,
                installmentTotal: total,
                generateFuture: false,
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [transaction, categories]);
    
    // Efeito para ajustar a data de pagamento quando o status muda para "Pago"
    useEffect(() => {
        if (formData.status === 'Pago' && (isNew || (transaction && transaction.status === 'Pendente'))) {
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, date: today }));
        }
    }, [formData.status, isNew, transaction]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let val: any = value;
        if (type === 'checkbox') {
            val = (e.target as HTMLInputElement).checked;
        } else if (name === 'amount' || name === 'installmentCurrent' || name === 'installmentTotal') {
            val = parseFloat(value) || 0;
        }

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };
    
    // Helper para adicionar meses corretamente (ex: 31 Jan + 1 mês = 28/29 Fev)
    const addMonths = (dateStr: string, months: number): string => {
        const date = new Date(dateStr);
        // Ajuste para fuso horário UTC para evitar problemas de dia
        const d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        
        const originalDay = d.getDate();
        d.setMonth(d.getMonth() + months);
        
        // Se o dia mudou (ex: era 31, virou 1, 2 ou 3), significa que o mês destino tem menos dias
        // Então voltamos para o último dia do mês anterior
        if (d.getDate() !== originalDay) {
            d.setDate(0);
        }
        return d.toISOString().split('T')[0];
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.description.trim() === '' || formData.amount <= 0) {
            alert('Descrição e valor são obrigatórios e o valor deve ser maior que zero.');
            return;
        }

        // Format installments string
        let installmentsStr = undefined;
        if (formData.accountType === 'Não Recorrente' && formData.installmentTotal > 1) {
            installmentsStr = `${formData.installmentCurrent}/${formData.installmentTotal}`;
        }

        const baseTransactionData: NewTransaction = {
            description: formData.description,
            amount: formData.amount,
            date: formData.date,
            dueDate: formData.dueDate,
            category: formData.category,
            status: formData.status,
            accountType: formData.accountType,
            installments: installmentsStr,
        };

        if (isNew) {
            // Lógica de Geração Automática de Parcelas
            if (formData.generateFuture && formData.accountType === 'Não Recorrente' && formData.installmentTotal > formData.installmentCurrent) {
                const transactionsToCreate: NewTransaction[] = [];
                
                // Adiciona a parcela atual
                transactionsToCreate.push(baseTransactionData);

                // Gera as próximas
                for (let i = formData.installmentCurrent + 1; i <= formData.installmentTotal; i++) {
                    const monthsToAdd = i - formData.installmentCurrent;
                    const nextDueDate = addMonths(formData.dueDate, monthsToAdd);
                    
                    transactionsToCreate.push({
                        ...baseTransactionData,
                        status: 'Pendente', // Futuras nascem pendentes
                        date: nextDueDate, // Data ref para ordenação
                        dueDate: nextDueDate,
                        installments: `${i}/${formData.installmentTotal}`,
                    });
                }
                
                onSave(transactionsToCreate, true);
            } else {
                onSave(baseTransactionData, true);
            }
        } else {
            // Edição
            onSave({ ...baseTransactionData, id: transaction!.id }, false);
        }
    };

    const inputStyles = "block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition-colors";
    const labelStyles = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const disabledTextStyles = "block w-full bg-slate-100 dark:bg-slate-700 rounded-lg py-2.5 px-3 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600";

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isNew ? 'Adicionar Novo Pagamento' : 'Editar Pagamento'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="description" className={labelStyles}>Descrição</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className={inputStyles} required autoFocus />
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
                            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Configuração de Parcelas</label>
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1">
                                        <label htmlFor="installmentCurrent" className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Parcela Atual</label>
                                        <input 
                                            type="number" 
                                            name="installmentCurrent" 
                                            id="installmentCurrent" 
                                            value={formData.installmentCurrent} 
                                            onChange={handleChange} 
                                            className={inputStyles} 
                                            min="1" 
                                        />
                                    </div>
                                    <div className="text-slate-400 mt-5">/</div>
                                    <div className="flex-1">
                                        <label htmlFor="installmentTotal" className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Total</label>
                                        <input 
                                            type="number" 
                                            name="installmentTotal" 
                                            id="installmentTotal" 
                                            value={formData.installmentTotal} 
                                            onChange={handleChange} 
                                            className={inputStyles} 
                                            min="1" 
                                        />
                                    </div>
                                </div>
                                {isNew && formData.installmentTotal > formData.installmentCurrent && (
                                    <div className="mt-3 flex items-start gap-2">
                                        <input 
                                            type="checkbox" 
                                            name="generateFuture" 
                                            id="generateFuture" 
                                            checked={formData.generateFuture} 
                                            onChange={handleChange}
                                            className="mt-1 w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
                                        />
                                        <label htmlFor="generateFuture" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                            Gerar automaticamente as <strong>{formData.installmentTotal - formData.installmentCurrent}</strong> parcelas futuras?
                                            <span className="block text-xs text-slate-500 mt-0.5">As datas de vencimento serão geradas para os próximos meses.</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                            {isNew ? (Array.isArray(formData) ? 'Adicionar Vários' : 'Adicionar') : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
