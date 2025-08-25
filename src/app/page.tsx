'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, login, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return <Dashboard />;
}
