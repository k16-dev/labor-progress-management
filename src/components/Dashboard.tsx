'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CentralDashboard from './dashboard/CentralDashboard';
import TaskManagement from './dashboard/TaskManagement';
import DebugPanel from './DebugPanel';

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold">統合進捗管理システム</h1>
              <p className="text-blue-100 text-sm">
                {user.orgName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* Debug Panel */}
      <DebugPanel />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user.role === 'central' ? (
          <CentralDashboard />
        ) : (
          <TaskManagement />
        )}
      </main>
    </div>
  );
}