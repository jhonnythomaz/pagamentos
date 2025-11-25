
// App.tsx
import React, { useState, useEffect } from 'react';
import { Transaction, ToastMessage, NewTransaction, User } from './types';
import * as api from './services/api';
import * as authService from './services/authService';
import notificationService, { notify } from './services/notificationService';
import { LogoIcon, DashboardIcon, TransactionsIcon, ReportsIcon, CalendarIcon, DocumentTextIcon, SettingsIcon, MoonIcon, SunIcon, MenuIcon, CloseIcon, LogoutIcon } from './components/Icons';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import CalendarView from './components/CalendarView';
import AccountsDueView from './components/AccountsDueView';
import ToastContainer from './components/ToastContainer';
import TransactionModal from './components/TransactionModal';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';

type View = 'dashboard' | 'transactions' | 'reports' | 'calendar' | 'accountsDue' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // UI States
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth Effect
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
        handleLoginSuccess(currentUser);
    } else {
        setLoading(false); // Stop loading if no user
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
      setUser(user);
      api.initApi(user.id); // Initialize API with specific User ID
      fetchData();
  };

  const handleLogout = () => {
      authService.logout();
      setUser(null);
      setTransactions([]);
      setCategories([]);
      setView('dashboard');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transData, catData, budgetData] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getBudget()
      ]);
      setTransactions(transData);
      setCategories(catData);
      setMonthlyBudget(budgetData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      notify.error("Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only subscribe to notifications if user is logged in
    if (user) {
        const unsubscribe = notificationService.subscribe(setToastMessages);
        return () => unsubscribe();
    }
  }, [user]);
  
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

  const addMonthsToDate = (dateStr: string, months: number): string => {
      const date = new Date(dateStr);
      const d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const originalDay = d.getDate();
      
      d.setMonth(d.getMonth() + months);
      
      // Ajuste de estouro de dia (ex: 31/01 -> 28/02)
      if (d.getDate() !== originalDay) {
          d.setDate(0);
      }
      return d.toISOString().split('T')[0];
  };

  const createNextInstallment = (transaction: Transaction): NewTransaction | null => {
      // Usar lógica robusta de adicionar mês
      const newDueDateString = addMonthsToDate(transaction.dueDate, 1);

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

  const handleSaveTransaction = async (transactionData: Transaction | NewTransaction | NewTransaction[], isNew: boolean) => {
      try {
          if (isNew) {
              if (Array.isArray(transactionData)) {
                  // Lote de transações (ex: parcelas geradas)
                  const count = transactionData.length;
                  await api.addMultipleTransactions(transactionData as NewTransaction[]);
                  notify.success(`${count} pagamentos adicionados com sucesso!`);
              } else {
                  // Transação única
                  const newTransactionData = transactionData as NewTransaction;
                  await api.addTransaction(newTransactionData);
                  notify.success('Pagamento adicionado com sucesso!');
              }
          } else {
              // Edição (sempre único)
              const transaction = transactionData as Transaction;
              const originalTransaction = transactions.find(t => t.id === transaction.id);
              await api.updateTransaction(transaction);
              notify.success('Pagamento atualizado com sucesso!');

              // Lógica para sugerir próxima parcela/recorrência ao pagar
              if (originalTransaction?.status === 'Pendente' && transaction.status === 'Pago') {
                  const nextInstallment = createNextInstallment(transaction);
                  if (nextInstallment) {
                      // Check if a similar pending transaction already exists to avoid duplicates
                      const duplicate = transactions.find(t => 
                          t.description === nextInstallment.description &&
                          t.amount === nextInstallment.amount &&
                          t.dueDate === nextInstallment.dueDate &&
                          t.status === 'Pendente'
                      );
                      
                      if (!duplicate) {
                        await api.addTransaction(nextInstallment);
                        notify.info(`Próximo pagamento para "${transaction.description}" foi criado automaticamente.`);
                      }
                  }
              }
          }
          // Refresh only transactions
          const updatedTransactions = await api.getTransactions();
          setTransactions(updatedTransactions);
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
          const updatedTransactions = await api.getTransactions();
          setTransactions(updatedTransactions);
      } catch (error) {
          notify.error('Falha ao excluir o pagamento.');
          console.error(error);
      }
  };

  // Settings Handlers
  const handleAddCategory = async (category: string) => {
      try {
          const newCats = await api.addCategory(category);
          setCategories(newCats);
          notify.success(`Categoria "${category}" adicionada.`);
      } catch (e) {
          notify.error("Erro ao adicionar categoria.");
      }
  };

  const handleDeleteCategory = async (category: string) => {
       if (window.confirm(`Tem certeza que deseja excluir a categoria "${category}"?`)) {
            try {
                const newCats = await api.deleteCategory(category);
                setCategories(newCats);
                notify.success(`Categoria removida.`);
            } catch (e) {
                notify.error("Erro ao remover categoria.");
            }
       }
  };

  const handleUpdateBudget = async (amount: number) => {
      try {
          await api.setBudget(amount);
          setMonthlyBudget(amount);
      } catch (e) {
          notify.error("Erro ao salvar orçamento.");
      }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={transactions} monthlyBudget={monthlyBudget} setView={setView} onTransactionClick={openTransactionModal} />;
      case 'transactions':
        return <TransactionsView transactions={transactions} categories={categories} onEditTransaction={openTransactionModal} onDelete={handleDeleteTransaction}/>;
      case 'reports':
        return <ReportsView transactions={transactions} />;
      case 'calendar':
        return <CalendarView transactions={transactions} onTransactionClick={openTransactionModal} />;
      case 'accountsDue':
        return <AccountsDueView transactions={transactions} />;
      case 'settings':
        return <SettingsView 
                    categories={categories} 
                    onAddCategory={handleAddCategory} 
                    onDeleteCategory={handleDeleteCategory}
                    currentBudget={monthlyBudget}
                    onUpdateBudget={handleUpdateBudget}
                />;
      default:
        return <Dashboard transactions={transactions} monthlyBudget={monthlyBudget} setView={setView} onTransactionClick={openTransactionModal} />;
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
          onClick={() => { onClick(viewName); setIsSidebarOpen(false); }}
          className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentView === viewName
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
          {icon}
          <span className="ml-3">{label}</span>
      </button>
  );

  // --- Render Login View if not Authenticated ---
  if (!user) {
      return (
          <>
            <ToastContainer messages={toastMessages} onDismiss={handleDismissToast} />
            <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
                 <LoginView onLoginSuccess={handleLoginSuccess} onError={(msg) => notify.error(msg)} />
            </div>
          </>
      );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans transition-colors duration-300">
      <ToastContainer messages={toastMessages} onDismiss={handleDismissToast} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-2 py-4 mb-4">
              <div className="flex items-center gap-2">
                <LogoIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Alecrim</h1>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{user.name}</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400">
                  <CloseIcon />
              </button>
          </div>
          <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
              <NavLink currentView={view} viewName="dashboard" icon={<DashboardIcon />} label="Painel" onClick={setView} />
              <NavLink currentView={view} viewName="transactions" icon={<TransactionsIcon />} label="Pagamentos" onClick={setView} />
              <NavLink currentView={view} viewName="accountsDue" icon={<DocumentTextIcon />} label="Contas a Vencer" onClick={setView} />
              <NavLink currentView={view} viewName="calendar" icon={<CalendarIcon />} label="Calendário" onClick={setView} />
              <NavLink currentView={view} viewName="reports" icon={<ReportsIcon />} label="Relatórios" onClick={setView} />
          </nav>
          
          <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-2">
            <NavLink currentView={view} viewName="settings" icon={<SettingsIcon />} label="Configurações" onClick={setView} />
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                <span className="ml-3">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
            <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-danger hover:bg-danger/10 transition-colors"
            >
                <LogoutIcon className="w-6 h-6" />
                <span className="ml-3">Sair</span>
            </button>
          </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300 mr-4">
                <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                {view === 'accountsDue' ? 'Contas a Vencer' : view}
            </h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400">Carregando dados...</p>
                    </div>
                </div>
            ) : renderView()}
        </main>
      </div>
      
      {isModalOpen && (
        <TransactionModal
            transaction={selectedTransaction}
            categories={categories}
            onClose={closeTransactionModal}
            onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};

export default App;
