"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

export type ONG = {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  description?: string;
  short?: string;
};

export type UserProfile = {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  organizations?: ONG[];
  image?: string;
  bio?: string;
  role?: { nome_perfil?: string; _id?: string; descricao?: string };
  token?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUser: (userData: Partial<UserProfile>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário e token do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
        localStorage.removeItem('usuario');
      }
    }

    if (storedToken) {
      setToken(storedToken);
      // Configura o token no axios
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const updateUser = (userData: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;

      const updated = { ...prev, ...userData };
      localStorage.setItem('usuario', JSON.stringify(updated));

      // Dispara evento para outros componentes
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updated }));

      return updated;
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/v1/usuarios/login', { email, password });
      const data = response.data;

      const userData: UserProfile = {
        _id: data._id,
        name: data.username || data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        image: data.image,
        bio: data.bio,
        organizations: data.organizations || [],
        role: data.role,
        token: data.token,
      };

      setUser(userData);
      setToken(data.token);

      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('token', data.token);

      // Configura o token no axios
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];

    // Redirecionar para página de login se necessário
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    loading,
    setUser,
    updateUser,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
