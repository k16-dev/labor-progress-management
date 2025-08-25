'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, AuthSession } from '@/lib/auth';

interface AuthContextType {
  user: AuthSession | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = (session: AuthSession) => {
    AuthService.saveSession(session);
    setUser(session);
  };

  const logout = () => {
    AuthService.clearSession();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}