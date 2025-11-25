
// services/authService.ts
import { User } from '../types';

const USERS_DB_KEY = 'alecrim_users_db';
const CURRENT_SESSION_KEY = 'alecrim_session_user';

const getUsers = (): User[] => {
    const usersStr = localStorage.getItem(USERS_DB_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        throw new Error('Este e-mail já está cadastrado.');
    }

    const newUser: User = {
        id: 'user_' + new Date().getTime().toString(36),
        name,
        email,
        password // Em produção, isso deveria ser um hash e estar no backend
    };

    users.push(newUser);
    saveUsers(users);
    
    // Auto login após registro
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(newUser));
    return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('E-mail ou senha inválidos.');
    }

    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    return user;
};

export const logout = () => {
    localStorage.removeItem(CURRENT_SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem(CURRENT_SESSION_KEY);
    return userStr ? JSON.parse(userStr) : null;
};
