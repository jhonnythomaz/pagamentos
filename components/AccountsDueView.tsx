import React, { useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { ClipboardListIcon } from './Icons';

interface AccountsDueViewProps {
  transactions: Transaction[];
  onMarkAsPaid: (id: string) => void;
}

const StatusIndicator: React.FC<{ isOverdue: boolean }> = ({ isOverdue }) => {
    const config = isOverdue 
        ? { label: 'Vencido', color: 'bg-danger', textColor: 'text-danger' } 
        : { label: 'A Vencer', color: 'bg-warning', textColor: 'text-warning' };

    return (
        <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full ${config.color} mr-2`}></span>
            <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
        </div>
    );
};


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

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {pendingTransactions.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="py-3 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pendingTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className={`py-4 px-6 text-sm whitespace-nowrap font-medium ${t.isOverdue ? 'text-danger' : 'text-slate-700'}`}>
                        {new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-800">{t.description}</td>
                    <td className="py-4 px-6">
                        <StatusIndicator isOverdue={t.isOverdue} />
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-slate-800">{currencyFormatter(t.amount)}</td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => onMarkAsPaid(t.id)} 
                        className="bg-success text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Marcar como Paga
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
                <ClipboardListIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-800">Tudo em Dia!</h3>
                <p className="mt-2 text-sm text-slate-500">Você não tem nenhuma conta pendente no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsDueView;