import React, { useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';

interface AccountsDueViewProps {
  transactions: Transaction[];
  onMarkAsPaid: (id: string) => void;
}

const AccountsDueView: React.FC<AccountsDueViewProps> = ({ transactions, onMarkAsPaid }) => {
  const pendingTransactions = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    
    return transactions
      .filter(t => t.status === TransactionStatus.PENDING)
      .map(t => ({
        ...t,
        isOverdue: new Date(t.date) < now,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const currencyFormatter = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Contas a Vencer</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          {pendingTransactions.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="py-3 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map(t => (
                  <tr key={t.id} className={`border-b border-slate-200 ${t.isOverdue ? '' : 'hover:bg-slate-50'}`}>
                    <td className={`py-4 px-6 text-sm whitespace-nowrap ${t.isOverdue ? 'font-semibold text-danger' : 'text-slate-700'}`}>
                      <div className={`pl-2 ${t.isOverdue ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'}`}>
                        {new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{t.description}</td>
                    <td className="py-4 px-6 text-sm text-slate-700">{t.category}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-slate-800">{currencyFormatter(t.amount)}</td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => onMarkAsPaid(t.id)} 
                        className="bg-success text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Marcar como Paga
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-slate-500 p-8">
                <p>Você não tem nenhuma conta pendente. Tudo em dia!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsDueView;