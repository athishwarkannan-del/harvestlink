"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'farmer' | 'consumer' | 'admin';
  location: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hl_token');
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile to verify token
      apiFetch<User>('/auth/me', { token: storedToken })
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid or expired
          localStorage.removeItem('hl_token');
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('hl_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('hl_token');
    setToken(null);
    setUser(null);
    // Optional: Call /api/auth/signout to invalidate on backend
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
