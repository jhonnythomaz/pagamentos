// App.tsx
import React, { useState, useEffect } from 'react';
import { Transaction, ToastMessage, NewTransaction } from './types';
import * as api from './services/api';
import notificationService, { notify } from './services/notificationService';
import { LogoIcon, DashboardIcon, TransactionsIcon, ReportsIcon, CalendarIcon, DocumentTextIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import CalendarView from './components/CalendarView';
import AccountsDueView from './components/AccountsDueView';
import ToastContainer from './components/ToastContainer';
import TransactionModal from './components/TransactionModal';

type View = 'dashboard' | 'transactions' | 'reports' | 'calendar' | 'accountsDue';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      notify.error("Falha ao carregar transações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const unsubscribe = notificationService.subscribe(setToastMessages);
    return () => unsubscribe();
  }, []);
  
  const handleDismissToast = (id: number) => {
    notificationService.dismiss(id);
  };
  
  const openTransactionModal = (transaction: Transaction | null) => {
      setSelectedTransaction(transaction);
      setIsModalOpen(true);
  };

  const closeTransactionModal = () => {
      setIsModalOpen(false);
      setSelectedTransaction(null);
  };

  const createNextInstallment = (transaction: Transaction): NewTransaction | null => {
      const originalDueDate = new Date(transaction.dueDate);
      const year = originalDueDate.getUTCFullYear();
      const month = originalDueDate.getUTCMonth();
      const day = originalDueDate.getUTCDate();
      
      const nextDueDate = new Date(Date.UTC(year, month + 1, day));
      
      if (nextDueDate.getUTCMonth() !== (month + 1) % 12) {
          nextDueDate.setUTCDate(0);
      }
      
      const newDueDateString = nextDueDate.toISOString().split('T')[0];

      if (transaction.accountType === 'Recorrente') {
          return {
              description: transaction.description,
              amount: transaction.amount,
              category: transaction.category,
              accountType: transaction.accountType,
              status: 'Pendente',
              dueDate: newDueDateString,
              date: newDueDateString,
          };
      }

      if (transaction.accountType === 'Não Recorrente' && transaction.installments) {
          const [current, total] = transaction.installments.split('/').map(Number);
          if (current < total) {
              return {
                  description: transaction.description,
                  amount: transaction.amount,
                  category: transaction.category,
                  accountType: transaction.accountType,
                  status: 'Pendente',
                  installments: `${current + 1}/${total}`,
                  dueDate: newDueDateString,
                  date: newDueDateString,
              };
          }
      }
      return null;
  };

  const handleSaveTransaction = async (transactionData: Transaction | NewTransaction, isNew: boolean) => {
      try {
          if (isNew) {
              const newTransactionData: NewTransaction = {
                  description: transactionData.description,
                  amount: transactionData.amount,
                  date: transactionData.date,
                  dueDate: transactionData.dueDate,
                  category: transactionData.category,
                  status: transactionData.status,
                  accountType: transactionData.accountType,
                  installments: transactionData.installments,
              };
              await api.addTransaction(newTransactionData);
              notify.success('Pagamento adicionado com sucesso!');
          } else {
              const transaction = transactionData as Transaction;
              const originalTransaction = transactions.find(t => t.id === transaction.id);
              await api.updateTransaction(transaction);
              notify.success('Pagamento atualizado com sucesso!');

              if (originalTransaction?.status === 'Pendente' && transaction.status === 'Pago') {
                  const nextInstallment = createNextInstallment(transaction);
                  if (nextInstallment) {
                      await api.addTransaction(nextInstallment);
                      notify.info(`Próximo pagamento para "${transaction.description}" foi criado.`);
                  }
              }
          }
          fetchTransactions();
          closeTransactionModal();
      } catch (error) {
          notify.error('Falha ao salvar o pagamento.');
          console.error(error);
      }
  };

  const handleDeleteTransaction = async (id: string) => {
      try {
          await api.deleteTransaction(id);
          notify.success('Pagamento excluído com sucesso!');
          fetchTransactions();
      } catch (error) {
          notify.error('Falha ao excluir o pagamento.');
          console.error(error);
      }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={transactions} setView={setView} onTransactionClick={openTransactionModal} />;
      case 'transactions':
        return <TransactionsView transactions={transactions} onEditTransaction={openTransactionModal} onDelete={handleDeleteTransaction}/>;
      case 'reports':
        return <ReportsView transactions={transactions} />;
      case 'calendar':
        return <CalendarView transactions={transactions} onTransactionClick={openTransactionModal} />;
      case 'accountsDue':
        return <AccountsDueView transactions={transactions} />;
      default:
        return <Dashboard transactions={transactions} setView={setView} onTransactionClick={openTransactionModal} />;
    }
  };
  
  const NavLink: React.FC<{
      currentView: View;
      viewName: View;
      icon: React.ReactNode;
      label: string;
      onClick: (view: View) => void;
  }> = ({ currentView, viewName, icon, label, onClick }) => (
      <button
          onClick={() => onClick(viewName)}
          className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentView === viewName
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200'
          }`}
      >
          {icon}
          <span className="ml-3">{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <ToastContainer messages={toastMessages} onDismiss={handleDismissToast} />
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4">
          <div className="flex items-center gap-2 px-2 py-4">
              <LogoIcon className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold text-slate-800">FinanDash</h1>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
              <NavLink currentView={view} viewName="dashboard" icon={<DashboardIcon />} label="Painel" onClick={setView} />
              <NavLink currentView={view} viewName="transactions" icon={<TransactionsIcon />} label="Pagamentos" onClick={setView} />
              <NavLink currentView={view} viewName="accountsDue" icon={<DocumentTextIcon />} label="Contas a Vencer" onClick={setView} />
              <NavLink currentView={view} viewName="calendar" icon={<CalendarIcon />} label="Calendário" onClick={setView} />
              <NavLink currentView={view} viewName="reports" icon={<ReportsIcon />} label="Relatórios" onClick={setView} />
          </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Carregando dados...</p>
            </div>
        ) : renderView()}
      </main>
      
      {isModalOpen && (
        <TransactionModal
            transaction={selectedTransaction}
            onClose={closeTransactionModal}
            onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};

export default App;