import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, NewTransaction, TransactionType, AccountCategory } from '../types';
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
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [accountType, setAccountType] = useState<AccountCategory>(AccountCategory.RECURRING);
  const [isInstallments, setIsInstallments] = useState(false);
  const [installmentsCurrent, setInstallmentsCurrent] = useState(1);
  const [installmentsTotal, setInstallmentsTotal] = useState(2);
  const [attachmentName, setAttachmentName] = useState('');

  const resetForm = useCallback(() => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(TransactionType.EXPENSE);
    setCategory(categories.length > 0 ? categories[0] : '');
    setNewCategory('');
    setAccountType(AccountCategory.RECURRING);
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
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAccountType(transactionToEdit.accountType);
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
      type,
      category: finalCategory,
      accountType,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{transactionToEdit ? 'Editar Transação' : 'Adicionar Nova Transação'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as TransactionType)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                <option value={TransactionType.INCOME}>Receita</option>
                <option value={TransactionType.EXPENSE}>Despesa</option>
              </select>
            </div>
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">Tipo de Conta</label>
              <select id="accountType" value={accountType} onChange={e => setAccountType(e.target.value as AccountCategory)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                <option value={AccountCategory.RECURRING}>Recorrente</option>
                <option value={AccountCategory.NON_RECURRING}>Não Recorrente</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              <option value="new">-- Adicionar Nova Categoria --</option>
            </select>
          </div>
          {category === 'new' && (
            <div>
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">Nome da Nova Categoria</label>
              <input type="text" id="newCategory" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
          )}
          <div>
            <div className="flex items-center">
              <input id="installments-checkbox" type="checkbox" checked={isInstallments} onChange={(e) => setIsInstallments(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <label htmlFor="installments-checkbox" className="ml-2 block text-sm text-gray-900">Este é um pagamento parcelado</label>
            </div>
          </div>
          {isInstallments && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="installmentsCurrent" className="block text-sm font-medium text-gray-700">Parcela Atual</label>
                <input type="number" id="installmentsCurrent" value={installmentsCurrent} onChange={e => setInstallmentsCurrent(parseInt(e.target.value, 10))} min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label htmlFor="installmentsTotal" className="block text-sm font-medium text-gray-700">Total de Parcelas</label>
                <input type="number" id="installmentsTotal" value={installmentsTotal} onChange={e => setInstallmentsTotal(parseInt(e.target.value, 10))} min="2" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
            </div>
          )}
           <div>
              <label className="block text-sm font-medium text-gray-700">Anexo (PDF)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Carregar um arquivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => setAttachmentName(e.target.files ? e.target.files[0].name : '')} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">{attachmentName || 'PDF de até 10MB'}</p>
                </div>
              </div>
            </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors">{transactionToEdit ? 'Salvar Alterações' : 'Criar Transação'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;