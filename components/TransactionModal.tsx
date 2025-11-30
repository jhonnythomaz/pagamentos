import React, { useState, useEffect } from "react";
import { Transaction, NewTransaction } from "../types";
import { CloseIcon } from "./Icons";

interface TransactionModalProps {
  transaction: Transaction | null;
  categories: string[];
  onClose: () => void;
  // Adicionamos a prop isLoading para saber quando travar o botão
  onSave: (
    transaction: Transaction | NewTransaction,
    isNew: boolean
  ) => Promise<void>;
  isLoading?: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  categories,
  onClose,
  onSave,
  isLoading = false, // Padrão falso
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [status, setStatus] = useState<"Pago" | "Pendente">("Pendente");
  const [accountType, setAccountType] = useState<
    "Recorrente" | "Não Recorrente"
  >("Não Recorrente");
  const [installmentsCurrent, setInstallmentsCurrent] = useState("1");
  const [installmentsTotal, setInstallmentsTotal] = useState("1");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentDate, setPaymentDate] = useState("");

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setStatus(transaction.status);
      setAccountType(transaction.accountType);
      setDueDate(transaction.dueDate.split("T")[0]);
      setPaymentDate(transaction.date ? transaction.date.split("T")[0] : "");

      if (transaction.installments) {
        const [curr, total] = transaction.installments.split("/");
        setInstallmentsCurrent(curr);
        setInstallmentsTotal(total);
      }
    } else {
      // Limpar campos se for novo
      setDescription("");
      setAmount("");
      setCategory(categories[0] || "");
      setStatus("Pendente");
      setDueDate(new Date().toISOString().split("T")[0]);
    }
  }, [transaction, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: any = {
      description,
      amount: parseFloat(amount),
      category,
      status,
      accountType,
      dueDate,
      date: status === "Pago" ? paymentDate || dueDate : dueDate,
    };

    if (transaction) {
      // Edição
      await onSave({ ...transaction, ...transactionData }, false);
    } else {
      // Novo
      if (accountType === "Não Recorrente" && parseInt(installmentsTotal) > 1) {
        // Lógica de parcelas (simplificada para envio)
        // Aqui mandamos como transação única, o App.tsx ou Backend que lidem com a criação múltipla se necessário,
        // ou enviamos apenas os dados da primeira parcela
        transactionData.installments = `${installmentsCurrent}/${installmentsTotal}`;
      }
      await onSave(transactionData, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {transaction ? "Editar Pagamento" : "Adicionar Novo Pagamento"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="transaction-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Descrição */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                Descrição
              </label>
              <input
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="Ex: Aluguel, Internet..."
              />
            </div>

            {/* Valor e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                  Valor (R$)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                  {status === "Pago"
                    ? "Data de Pagamento"
                    : "Data de Vencimento"}
                </label>
                <input
                  type="date"
                  required
                  value={
                    status === "Pago" && paymentDate ? paymentDate : dueDate
                  }
                  onChange={(e) =>
                    status === "Pago"
                      ? setPaymentDate(e.target.value)
                      : setDueDate(e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Tipo de Conta */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
                Tipo de Conta
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="Recorrente">Recorrente (Todo mês)</option>
                <option value="Não Recorrente">
                  Não Recorrente (Parcelada ou Única)
                </option>
              </select>
            </div>

            {/* Parcelas (Só aparece se não for recorrente) */}
            {accountType === "Não Recorrente" && (
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <label className="block text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">
                  Configuração de Parcelas
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 mb-1 block">
                      Parcela Atual
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={installmentsCurrent}
                      onChange={(e) => setInstallmentsCurrent(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <span className="text-slate-500 pt-5">/</span>
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 mb-1 block">
                      Total
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={installmentsTotal}
                      onChange={(e) => setInstallmentsTotal(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            form="transaction-form"
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : transaction ? (
              "Salvar Alterações"
            ) : (
              "Adicionar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
