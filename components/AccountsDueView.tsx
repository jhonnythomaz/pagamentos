// components/AccountsDueView.tsx
import React from 'react';
import { Transaction } from '../types';
import { ClipboardListIcon } from './Icons';

interface AccountsDueViewProps {
  transactions: Transaction[];
}

const AccountsDueView: React.FC<AccountsDueViewProps> = ({ transactions }) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const pendingTransactions = transactions
    .filter(t => t.status === 'Pendente')
    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const currencyFormatter = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getStatusInfo = (dueDate: string): { text: string; color: string } => {
    const due = new Date(dueDate);
    due.setUTCHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Vencido há ${Math.abs(diffDays)} dia(s)`, color: 'text-danger' };
    }
    if (diffDays === 0) {
        return { text: 'Vence hoje', color: 'text-danger' };
    }
    return { text: `Vence em ${diffDays} dia(s)`, color: 'text-slate-500' };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Contas a Vencer</h1>
      
      <div className="bg-white rounded-xl shadow-card p-6">
        {pendingTransactions.length > 0 ? (
          <ul className="space-y-4">
            {pendingTransactions.map(t => {
                const statusInfo = getStatusInfo(t.dueDate);
                return (
                  <li key={t.id} className="p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">{t.description} {t.installments && <span className="font-normal text-slate-500">{t.installments}</span>}</p>
                      <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
                    </div>
                    <p className="font-bold text-lg text-slate-700 self-end sm:self-center">{currencyFormatter(t.amount)}</p>
                  </li>
                )
            })}
          </ul>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <ClipboardListIcon className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma conta pendente.</h3>
            <p className="mt-1 text-sm">Você está em dia com seus pagamentos programados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsDueView;