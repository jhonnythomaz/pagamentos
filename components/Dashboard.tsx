// components/Dashboard.tsx
import React, { useMemo, useState } from "react";
import { Transaction } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  TagIcon,
  ReportsIcon,
} from "./Icons";

interface DashboardProps {
  transactions: Transaction[];
  monthlyBudget: number;
  setView: (
    view: "dashboard" | "transactions" | "reports" | "calendar" | "accountsDue"
  ) => void;
  onTransactionClick: (transaction: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  monthlyBudget,
  setView,
  onTransactionClick,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("current"); // 'current' or 'YYYY-MM'

  // --- Period Calculation ---
  const availablePeriods = useMemo(() => {
    const periods = new Set<string>();
    transactions.forEach((t) => {
      const date = new Date(t.dueDate);
      const period = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      periods.add(period);
    });
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const formatPeriodForDisplay = (period: string) => {
    if (period === "current") return "Mês Atual";
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // --- Common Helpers ---
  const currencyFormatter = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // --- Current Month Data ---
  const currentMonthData = useMemo(() => {
    const totalExpenseThisMonth = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.status === "Pago" &&
          transactionDate.getUTCFullYear() === today.getUTCFullYear() &&
          transactionDate.getUTCMonth() === today.getUTCMonth()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const upcomingExpenses = transactions
      .filter((t) => t.status === "Pendente" && new Date(t.dueDate) >= today)
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueExpenses = transactions
      .filter((t) => t.status === "Pendente" && new Date(t.dueDate) < today)
      .reduce((sum, t) => sum + t.amount, 0);

    const upcomingDueTransactions = transactions
      .filter((t) => t.status === "Pendente" && new Date(t.dueDate) >= today)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5);

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalExpenseThisMonth,
      upcomingExpenses,
      overdueExpenses,
      upcomingDueTransactions,
      recentTransactions,
    };
  }, [transactions, today]);

  // --- Historical Period Data ---
  const historicalPeriodData = useMemo(() => {
    if (selectedPeriod === "current") return null;

    const [year, month] = selectedPeriod.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const paidInPeriod = transactions.filter((t) => {
      const paidDate = new Date(t.date);
      return (
        t.status === "Pago" && paidDate >= startDate && paidDate <= endDate
      );
    });
    const totalPaidInPeriod = paidInPeriod.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const accountsInPeriod = transactions.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return dueDate >= startDate && dueDate <= endDate;
    });
    const totalAccountsInPeriod = accountsInPeriod.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const categorySpending = accountsInPeriod.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalPaidInPeriod,
      totalAccountsInPeriod,
      topCategory: topCategory ? topCategory[0] : "N/A",
      accountsInPeriod: accountsInPeriod.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
      paidInPeriod: paidInPeriod.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  }, [transactions, selectedPeriod]);

  // --- Chart Data (Unaffected by filter) ---
  const monthlyExpenseData = useMemo(() => {
    const monthsData: { [key: string]: number } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toLocaleString("pt-BR", { month: "short" });
      monthsData[monthKey] = 0;
    }
    transactions.forEach((t) => {
      if (t.status === "Pago") {
        const transactionDate = new Date(t.date);
        const sixMonthsAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 5,
          1
        );
        sixMonthsAgo.setUTCHours(0, 0, 0, 0);
        if (transactionDate >= sixMonthsAgo) {
          const monthKey = transactionDate.toLocaleString("pt-BR", {
            month: "short",
          });
          if (monthsData[monthKey] !== undefined) {
            monthsData[monthKey] += t.amount;
          }
        }
      }
    });
    return Object.entries(monthsData).map(([name, value]) => ({
      name,
      Despesas: value,
    }));
  }, [transactions, today]);

  const getDaysUntilDue = (dueDate: string): string => {
    const due = new Date(dueDate);
    due.setUTCHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Venceu há ${Math.abs(diffDays)} dias`;
    if (diffDays === 0) return "Vence hoje";
    if (diffDays === 1) return "Vence amanhã";
    return `Vence em ${diffDays} dias`;
  };

  // --- Budget Logic ---
  const budgetUsage = useMemo(() => {
    if (monthlyBudget <= 0) return { percent: 0, color: "bg-primary" };

    // Considere gasto real (pago) + comprometido (pendente neste mês)
    const totalCommitted = currentMonthData.totalExpenseThisMonth;

    const percent = Math.min((totalCommitted / monthlyBudget) * 100, 100);
    let color = "bg-success";
    if (percent > 75) color = "bg-warning";
    if (percent >= 100) color = "bg-danger";

    return { percent, color, totalCommitted };
  }, [currentMonthData, monthlyBudget]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">
          Painel de Controle
        </h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="block w-full sm:w-auto border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition"
        >
          <option value="current">{formatPeriodForDisplay("current")}</option>
          {availablePeriods.map((period) => (
            <option key={period} value={period}>
              {formatPeriodForDisplay(period)}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Rendering for Dashboard View */}
      {selectedPeriod === "current" ? (
        <>
          {/* Budget Progress Bar */}
          {monthlyBudget > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card mb-8 border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-slate-600 dark:text-slate-300 font-semibold text-lg">
                    Meta de Gastos (Mês Atual)
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gasto:{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {currencyFormatter(budgetUsage.totalCommitted ?? 0)}
                    </span>{" "}
                    de {currencyFormatter(monthlyBudget)}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    budgetUsage.percent >= 100
                      ? "text-danger"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {(
                    ((budgetUsage?.totalCommitted ?? 0) /
                      (monthlyBudget || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${budgetUsage.color}`}
                  style={{ width: `${budgetUsage.percent}%` }}
                ></div>
              </div>
              {budgetUsage.percent >= 100 && (
                <p className="text-xs text-danger mt-1 font-medium">
                  Você excedeu sua meta de gastos!
                </p>
              )}
            </div>
          )}

          {/* Current Month View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Cards */}
            <div
              onClick={() => setView("transactions")}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all dark:hover:bg-slate-800/50"
            >
              <div className="p-3 rounded-full bg-success/10 dark:bg-success/20">
                <CheckCircleIcon className="text-success dark:text-success-light" />
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">
                  Despesas Pagas (Mês)
                </h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {currencyFormatter(currentMonthData.totalExpenseThisMonth)}
                </p>
              </div>
            </div>
            <div
              onClick={() => setView("accountsDue")}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all dark:hover:bg-slate-800/50"
            >
              <div className="p-3 rounded-full bg-warning/10 dark:bg-warning/20">
                <ClockIcon className="text-yellow-600 dark:text-warning" />
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">
                  A Vencer
                </h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {currencyFormatter(currentMonthData.upcomingExpenses)}
                </p>
              </div>
            </div>
            <div
              onClick={() => setView("accountsDue")}
              className={`p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all cursor-pointer hover:shadow-lg ${
                currentMonthData.overdueExpenses > 0
                  ? "bg-danger/10 dark:bg-danger/20 hover:bg-danger/20 dark:hover:bg-danger/30"
                  : "bg-white dark:bg-slate-900 dark:hover:bg-slate-800/50"
              }`}
            >
              <div
                className={`p-3 rounded-full ${
                  currentMonthData.overdueExpenses > 0
                    ? "bg-danger/20"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <ExclamationCircleIcon
                  className={`${
                    currentMonthData.overdueExpenses > 0
                      ? "text-danger dark:text-danger-light"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`${
                    currentMonthData.overdueExpenses > 0
                      ? "text-danger dark:text-danger-light"
                      : "text-slate-500 dark:text-slate-400"
                  } font-medium`}
                >
                  Vencido
                </h3>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    currentMonthData.overdueExpenses > 0
                      ? "text-danger dark:text-danger-light"
                      : "text-slate-800 dark:text-white"
                  }`}
                >
                  {currencyFormatter(currentMonthData.overdueExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lists */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Próximos Vencimentos
              </h2>
              {currentMonthData.upcomingDueTransactions.length > 0 ? (
                <ul className="space-y-2">
                  {currentMonthData.upcomingDueTransactions.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => onTransactionClick(t)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {t.description}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getDaysUntilDue(t.dueDate)}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        {currencyFormatter(t.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-2" />
                  <p>Nenhuma conta a vencer.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Pagamentos Recentes
              </h2>
              {currentMonthData.recentTransactions.length > 0 ? (
                <ul className="space-y-2">
                  {currentMonthData.recentTransactions.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => onTransactionClick(t)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {t.description}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(t.date).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}{" "}
                          -{" "}
                          <span
                            className={
                              t.status === "Pago"
                                ? "text-success dark:text-success-light"
                                : "text-yellow-700 dark:text-warning"
                            }
                          >
                            {t.status}
                          </span>
                        </p>
                      </div>
                      <p
                        className={`font-semibold text-danger dark:text-danger-light`}
                      >
                        {currencyFormatter(t.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-2" />
                  <p>Nenhum pagamento encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Historical Month View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
              <div className="p-3 rounded-full bg-success/10 dark:bg-success/20">
                <CheckCircleIcon className="text-success dark:text-success-light" />
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">
                  Despesas Pagas
                </h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {currencyFormatter(
                    historicalPeriodData?.totalPaidInPeriod || 0
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
              <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                <ReportsIcon className="text-primary dark:text-primary-light" />
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">
                  Total de Contas
                </h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {currencyFormatter(
                    historicalPeriodData?.totalAccountsInPeriod || 0
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
              <div className="p-3 rounded-full bg-purple-500/10 dark:bg-purple-500/20">
                <TagIcon className="text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 font-medium">
                  Categoria Principal
                </h3>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {historicalPeriodData?.topCategory}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Contas do Mês
              </h2>
              {historicalPeriodData &&
              historicalPeriodData.accountsInPeriod.length > 0 ? (
                <ul className="space-y-2">
                  {historicalPeriodData.accountsInPeriod.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => onTransactionClick(t)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {t.description}
                        </p>
                        <p
                          className={`text-sm ${
                            t.status === "Pago"
                              ? "text-success dark:text-success-light"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {t.status}
                        </p>
                      </div>
                      <p className="font-semibold text-danger dark:text-danger-light">
                        {currencyFormatter(t.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-2" />
                  <p>Nenhuma conta neste mês.</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Pagamentos Efetuados no Mês
              </h2>
              {historicalPeriodData &&
              historicalPeriodData.paidInPeriod.length > 0 ? (
                <ul className="space-y-2">
                  {historicalPeriodData.paidInPeriod.map((t) => (
                    <li
                      key={t.id}
                      onClick={() => onTransactionClick(t)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {t.description}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(t.date).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold text-danger dark:text-danger-light">
                        {currencyFormatter(t.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-2" />
                  <p>Nenhum pagamento efetuado neste mês.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Unchanging Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
          Despesas Pagas nos Últimos 6 Meses
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyExpenseData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              className="dark:stroke-slate-700"
            />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(tick) =>
                `R$${((tick as number) / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              formatter={(value: number) => currencyFormatter(value)}
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                borderColor: "var(--tooltip-border, #e2e8f0)",
                color: "var(--tooltip-text, #1e293b)",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              itemStyle={{ color: "var(--tooltip-text, #1e293b)" }}
            />
            <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
            <Bar
              dataKey="Despesas"
              fill={"hsl(221, 83%, 53%)"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
