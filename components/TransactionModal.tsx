import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, NewTransaction, AccountCategory, TransactionStatus } from '../types';
import { CloseIcon } from './Icons';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: NewTransaction | (Partial<NewTransaction> & { id: string })) => void;
  transactionToEdit?: Transaction | null;
  categories: string[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, categories }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [accountType, setAccountType] = useState<AccountCategory>(AccountCategory.RECURRING);
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PAID);
  const [isInstallments, setIsInstallments] = useState(false);
  const [installmentsCurrent, setInstallmentsCurrent] = useState(1);
  const [installmentsTotal, setInstallmentsTotal] = useState(2);
  const [attachmentName, setAttachmentName] = useState('');

  const resetForm = useCallback(() => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(categories.length > 0 ? categories[0] : '');
    setNewCategory('');
    setAccountType(AccountCategory.RECURRING);
    setStatus(TransactionStatus.PAID);
    setIsInstallments(false);
    setInstallmentsCurrent(1);
    setInstallmentsTotal(2);
    setAttachmentName('');
  }, [categories]);

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
      setCategory(transactionToEdit.category);
      setAccountType(transactionToEdit.accountType);
      setStatus(transactionToEdit.status);
      if (transactionToEdit.installments) {
        setIsInstallments(true);
        setInstallmentsCurrent(transactionToEdit.installments.current);
        setInstallmentsTotal(transactionToEdit.installments.total);
      } else {
        setIsInstallments(false);
      }
      setAttachmentName(transactionToEdit.attachment || '');
    } else {
      resetForm();
    }
  }, [transactionToEdit, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'new' ? newCategory : category;

    if (!description || !amount || !finalCategory) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const transactionData: NewTransaction = {
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category: finalCategory,
      accountType,
      status,
      ...(isInstallments && { installments: { current: installmentsCurrent, total: installmentsTotal } }),
      ...(attachmentName && { attachment: attachmentName }),
    };

    if (transactionToEdit) {
        onSave({ ...transactionData, id: transactionToEdit.id });
    } else {
        onSave(transactionData);
    }
  };

  if (!isOpen) return null;
  
  const inputStyles = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary";

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{transactionToEdit ? 'Editar Pagamento' : 'Adicionar Novo Pagamento'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-600">Descrição</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className={inputStyles} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-600">Valor</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" className={inputStyles} required />
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-600">Data</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={inputStyles} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-600">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} className={inputStyles}>
                <option value={TransactionStatus.PAID}>Pago</option>
                <option value={TransactionStatus.PENDING}>Pendente</option>
              </select>
            </div>
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-slate-600">Tipo de Conta</label>
              <select id="accountType" value={accountType} onChange={e => setAccountType(e.target.value as AccountCategory)} className={inputStyles}>
                <option value={AccountCategory.RECURRING}>Recorrente</option>
                <option value={AccountCategory.NON_RECURRING}>Não Recorrente</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-600">Categoria</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputStyles}>
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="new">-- Adicionar Nova Categoria --</option>
            </select>
          </div>
          {category === 'new' && (
            <div>
              <label htmlFor="newCategory" className="block text-sm font-medium text-slate-600">Nome da Nova Categoria</label>
              <input type="text" id="newCategory" value={newCategory} onChange={e => setNewCategory(e.target.value)} className={inputStyles} required />
            </div>
          )}
          <div>
            <div className="flex items-center">
              <input id="installments-checkbox" type="checkbox" checked={isInstallments} onChange={(e) => setIsInstallments(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary/50 border-slate-300 rounded" />
              <label htmlFor="installments-checkbox" className="ml-3 block text-sm font-medium text-slate-700">Este é um pagamento parcelado</label>
            </div>
          </div>
          {isInstallments && (
            <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 rounded-md border border-slate-200">
              <div>
                <label htmlFor="installmentsCurrent" className="block text-sm font-medium text-slate-600">Parcela Atual</label>
                <input type="number" id="installmentsCurrent" value={installmentsCurrent} onChange={e => setInstallmentsCurrent(parseInt(e.target.value, 10))} min="1" className={inputStyles} />
              </div>
              <div>
                <label htmlFor="installmentsTotal" className="block text-sm font-medium text-slate-600">Total de Parcelas</label>
                <input type="number" id="installmentsTotal" value={installmentsTotal} onChange={e => setInstallmentsTotal(parseInt(e.target.value, 10))} min="2" className={inputStyles} />
              </div>
            </div>
          )}
           <div>
              <label className="block text-sm font-medium text-slate-600">Anexo (PDF)</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Carregar um arquivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => setAttachmentName(e.target.files ? e.target.files[0].name : '')} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-slate-500">{attachmentName || 'PDF de até 10MB'}</p>
                </div>
              </div>
            </div>
          <div className="pt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm">{transactionToEdit ? 'Salvar Alterações' : 'Criar Pagamento'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;