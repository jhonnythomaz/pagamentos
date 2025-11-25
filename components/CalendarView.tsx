// components/CalendarView.tsx
import React, { useState } from 'react';
import { Transaction } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, onTransactionClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 41); // 6 weeks * 7 days - 1

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const transactionsByDate = transactions.reduce((acc, t) => {
    const dateToUse = t.status === 'Pendente' ? t.dueDate : t.date;
    const transactionDate = new Date(dateToUse);
    const dateKey = new Date(Date.UTC(transactionDate.getUTCFullYear(), transactionDate.getUTCMonth(), transactionDate.getUTCDate())).toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Calendário de Pagamentos</h1>
            <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-200 transition">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-xl font-semibold text-slate-700 w-40 text-center capitalize">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-200 transition">
                    <ChevronRightIcon />
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
            <div className="grid grid-cols-7 gap-px text-center font-semibold text-slate-600 mb-2">
                {weekDays.map(wd => <div key={wd}>{wd}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px min-h-[600px]">
                {days.map((d, index) => {
                    const dateKey = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().split('T')[0];
                    const dayTransactions = transactionsByDate[dateKey] || [];
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const isToday = d.toDateString() === new Date().toDateString();

                    return (
                        <div key={index} className={`border border-slate-200 p-2 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}`}>
                            <span className={`font-semibold self-start mb-1 ${isCurrentMonth ? 'text-slate-700' : 'text-slate-400'} ${isToday ? 'bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                                {d.getDate()}
                            </span>
                             <div className="overflow-y-auto text-xs space-y-1 flex-grow">
                                {dayTransactions.map(t => {
                                    let colorClasses = '';
                                    const dueDate = new Date(t.dueDate);
                                    dueDate.setUTCHours(0,0,0,0);
                                    const isOverdue = dueDate < today;

                                    if(t.status === 'Pago') {
                                        colorClasses = 'bg-slate-200 text-slate-600 hover:bg-slate-300';
                                    } else if (t.status === 'Pendente' && isOverdue) {
                                        colorClasses = 'bg-danger/20 text-danger font-semibold hover:bg-danger/30';
                                    } else { // Pendente a vencer
                                        colorClasses = 'bg-warning/20 text-yellow-800 hover:bg-warning/30';
                                    }
                                    
                                    return (
                                        <div 
                                          key={t.id} 
                                          onClick={() => onTransactionClick(t)}
                                          className={`p-1 rounded cursor-pointer transition-colors ${colorClasses}`}
                                        >
                                            <p className="truncate font-medium">{t.description}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CalendarView;