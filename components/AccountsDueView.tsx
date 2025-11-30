// components/AccountsDueView.tsx
import React from "react";
import { Transaction } from "../types";
import { DocumentTextIcon } from "./Icons";

interface AccountsDueViewProps {
  transactions: Transaction[];
}

const AccountsDueView: React.FC<AccountsDueViewProps> = ({ transactions }) => {
  // Filtra apenas contas Pendentes (não pagas)
  const dueTransactions = transactions
    .filter((t) => t.status === "Pendente")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const totalDue = dueTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Contas a Vencer
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gerencie seus próximos pagamentos
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
            Total Pendente
          </span>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalDue)}
          </p>
        </div>
      </div>

      {dueTransactions.length === 0 ? (
        // AQUI ESTAVA O PROBLEMA: Adicionei classes de tamanho e centralização
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-full mb-4">
            {/* O segredo: w-16 h-16 segura o tamanho do ícone */}
            <DocumentTextIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            Tudo em dia!
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Você não tem contas pendentes no momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dueTransactions.map((transaction) => {
            const isOverdue =
              new Date(transaction.dueDate) <
              new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={transaction.id}
                className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-l-4 transition-transform hover:-translate-y-1 ${
                  isOverdue
                    ? "border-l-red-500 border-slate-200 dark:border-slate-700"
                    : "border-l-yellow-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isOverdue
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {isOverdue ? "Vencida" : "A Vencer"}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-white mb-1 truncate">
                  {transaction.description}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {transaction.category}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Valor</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(transaction.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Vencimento</p>
                    <p
                      className={`font-medium ${
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {new Date(transaction.dueDate).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountsDueView;
