import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface UserSession {
  user_id: number;
  user_nome: string;
  user_nivel: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (token: string, user: UserSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('igrejaplus_token'));
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('igrejaplus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newToken: string, newUser: UserSession) => {
    localStorage.setItem('igrejaplus_token', newToken);
    localStorage.setItem('igrejaplus_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('igrejaplus_token');
    localStorage.removeItem('igrejaplus_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
