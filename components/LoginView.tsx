
// components/LoginView.tsx
import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { LogoIcon } from './Icons';

interface LoginViewProps {
    onLoginSuccess: (user: User) => void;
    onError: (message: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onError }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isRegistering) {
                if (!name || !email || !password) {
                    throw new Error("Preencha todos os campos.");
                }
                const user = await authService.register(name, email, password);
                onLoginSuccess(user);
            } else {
                if (!email || !password) {
                    throw new Error("Preencha todos os campos.");
                }
                const user = await authService.login(email, password);
                onLoginSuccess(user);
            }
        } catch (error: any) {
            onError(error.message || 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "block w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors mb-4";
    const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in-right">
                <div className="bg-primary p-6 text-center">
                    <div className="inline-flex bg-white/20 p-3 rounded-full mb-3">
                        <LogoIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Alecrim</h1>
                    <p className="text-primary-light text-sm mt-1">Organize suas finanças com simplicidade.</p>
                </div>
                
                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                        {isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {isRegistering && (
                            <div>
                                <label className={labelClasses}>Nome Completo</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className={inputClasses} 
                                    placeholder="Seu nome"
                                />
                            </div>
                        )}

                        <div>
                            <label className={labelClasses}>E-mail</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className={inputClasses} 
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className={labelClasses}>Senha</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className={inputClasses} 
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                isRegistering ? 'Cadastrar' : 'Entrar'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-200 dark:border-slate-700 pt-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                        </p>
                        <button 
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                onError(''); // Clear errors
                                setName('');
                                setEmail('');
                                setPassword('');
                            }}
                            className="mt-2 text-primary hover:text-primary-hover font-semibold text-sm transition-colors"
                        >
                            {isRegistering ? 'Fazer Login' : 'Criar nova conta'}
                        </button>
                    </div>
                </div>
                {/* Disclaimer about security (Simulation only) */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center">
                    <p className="text-xs text-yellow-800 dark:text-yellow-500">
                        Nota: Sistema de login demonstrativo. Dados salvos apenas neste navegador.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
