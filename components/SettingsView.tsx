import React, { useState } from "react";

interface SettingsViewProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  currentBudget: number;
  onUpdateBudget: (amount: number) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  currentBudget,
  onUpdateBudget,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [budget, setBudget] = useState(currentBudget.toString());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); // Impede recarregar a página
    if (newCategory.trim()) {
      onAddCategory(newCategory); // Chama a função que vai no Banco
      setNewCategory(""); // Limpa o campo
    }
  };

  const handleBudgetSave = () => {
    onUpdateBudget(parseFloat(budget));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Configurações
      </h2>

      {/* Categorias */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Gerenciar Categorias
        </h3>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria..."
            className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Adicionar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full"
            >
              <span className="text-slate-700 dark:text-slate-200 text-sm">
                {cat}
              </span>
              <button
                onClick={() => onDeleteCategory(cat)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Meta de Gastos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Meta de Gastos Mensal
        </h3>
        <div className="flex gap-2 max-w-sm">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-800 dark:text-white"
          />
          <button
            onClick={handleBudgetSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
