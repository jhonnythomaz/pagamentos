
// components/SettingsView.tsx
import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from './Icons';

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
    onUpdateBudget
}) => {
    const [newCategory, setNewCategory] = useState('');
    const [budgetInput, setBudgetInput] = useState(currentBudget.toString());

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleBudgetSave = () => {
        const val = parseFloat(budgetInput);
        if (!isNaN(val) && val >= 0) {
            onUpdateBudget(val);
            alert('Meta de gastos atualizada com sucesso!');
        }
    };

    const inputStyles = "block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm py-2.5 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/80 focus:border-primary transition-colors";

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 transition-colors">Configurações</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metas de Gastos */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card h-fit border border-slate-100 dark:border-slate-800 transition-colors">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Meta de Gastos Mensal</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Defina um valor máximo para seus gastos mensais. Isso exibirá uma barra de progresso no seu Painel.
                    </p>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                            <input 
                                type="number" 
                                id="budget"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                className={inputStyles}
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <button 
                            onClick={handleBudgetSave}
                            className="bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            Salvar
                        </button>
                    </div>
                </div>

                {/* Gestão de Categorias */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 transition-colors">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Gerenciar Categorias</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Adicione ou remova categorias para organizar seus pagamentos.
                    </p>
                    
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nova categoria..."
                            className={inputStyles}
                        />
                        <button 
                            type="submit"
                            className="bg-success text-white font-semibold p-2.5 rounded-lg hover:bg-success-hover transition-colors shadow-sm flex items-center justify-center min-w-[3rem]"
                            disabled={!newCategory.trim()}
                        >
                            <PlusIcon />
                        </button>
                    </form>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 group hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                                <button 
                                    onClick={() => onDeleteCategory(cat)}
                                    className="text-slate-400 hover:text-danger dark:hover:text-danger-light p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Excluir Categoria"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
