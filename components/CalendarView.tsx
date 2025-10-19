import React, { useState, useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  transactions: Transaction[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const statusColors: { [key: string]: string } = {
    'bg-success': 'hsl(142, 69%, 45%)',
    'bg-danger': 'hsl(0, 72%, 51%)',
    'bg-warning': 'hsl(38, 92%, 50%)',
  };

  const transactionsByDate = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(t);
    });
    return grouped;
  }, [transactions]);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
  }

  const getStatusInfo = (transaction: Transaction) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);

      if (transaction.status === TransactionStatus.PAID) {
          return { colorClass: 'bg-success', label: 'Pago' };
      }
      if (transactionDate < today) {
          return { colorClass: 'bg-danger', label: 'Vencido' };
      }
      return { colorClass: 'bg-warning', label: 'Pendente' };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Calendário de Pagamentos</h1>
        <div className="flex items-center gap-4">
            <span className="text-xl font-semibold text-slate-700">
                {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600"><ChevronLeftIcon className="w-5 h-5"/></button>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center font-semibold text-slate-500 text-sm bg-slate-200 border-l border-t border-slate-200">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-3 bg-slate-50">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 grid-rows-6 gap-px flex-1 bg-slate-200 border-l border-t border-slate-200">
        {days.map(date => {
          const dateKey = date.toISOString().split('T')[0];
          const dayTransactions = transactionsByDate.get(dateKey) || [];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();

          return (
            <div key={dateKey} className={`p-2 flex flex-col bg-white overflow-hidden ${isCurrentMonth ? '' : 'bg-slate-50'}`}>
              <time dateTime={dateKey} className={`flex items-center justify-center text-sm font-semibold w-7 h-7 rounded-full ${isToday(date) ? 'bg-primary text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                {date.getDate()}
              </time>
              <div className="mt-2 space-y-1.5 overflow-y-auto pr-1">
                {dayTransactions.map(t => {
                  const { colorClass } = getStatusInfo(t);
                  return (
                    <div 
                      key={t.id} 
                      title={`${t.description} - ${t.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`} 
                      className="text-xs p-1.5 rounded-md flex items-center bg-slate-100/70 border-l-4" 
                      style={{ borderColor: statusColors[colorClass] || 'transparent' }}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${colorClass}`}></span>
                      <span className="truncate font-medium text-slate-700">{t.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;