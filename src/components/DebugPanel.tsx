'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { FirestoreService } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugPanel() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  const runDiagnostics = async () => {
    const results: string[] = [];
    
    // 1. Firebase初期化チェック
    results.push(`Firebase DB: ${db ? 'initialized' : 'null'}`);
    results.push(`User: ${user ? JSON.stringify(user) : 'not logged in'}`);
    
    // 2. Firestore接続テスト
    try {
      const orgs = await FirestoreService.getOrganizations();
      results.push(`Organizations loaded: ${orgs.length} items`);
    } catch (error) {
      results.push(`Organizations error: ${error}`);
    }
    
    // 3. Progress取得テスト
    if (user?.orgId) {
      try {
        const progress = await FirestoreService.getProgressByOrganization(user.orgId);
        results.push(`Progress loaded: ${progress.length} items`);
      } catch (error) {
        results.push(`Progress error: ${error}`);
      }
    }
    
    setTestResults(results);
  };

  const testProgressUpdate = async () => {
    if (!user?.orgId) {
      setTestResults(prev => [...prev, 'No user logged in for test']);
      return;
    }

    try {
      // テスト用のタスクとステータス更新
      await FirestoreService.createOrUpdateProgress(
        'task_001', 
        user.orgId, 
        '完了', 
        'デバッグテスト'
      );
      setTestResults(prev => [...prev, 'Test progress update: SUCCESS']);
    } catch (error) {
      setTestResults(prev => [...prev, `Test progress update: ERROR - ${error}`]);
    }
  };

  useEffect(() => {
    setDebugInfo({
      window: typeof window !== 'undefined',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      currentURL: typeof window !== 'undefined' ? window.location.href : 'N/A',
    });
  }, []);

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 m-4 rounded">
        <h3 className="font-bold text-red-800">Debug Panel - No User</h3>
        <p>Please login first to access debug features.</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded">
      <h3 className="font-bold text-yellow-800 mb-3">🔧 Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={runDiagnostics}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2"
        >
          Run Diagnostics
        </button>
        <button 
          onClick={testProgressUpdate}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Test Progress Update
        </button>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Environment:</h4>
        <pre className="bg-gray-100 p-2 text-xs rounded overflow-x-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {testResults.length > 0 && (
        <div>
          <h4 className="font-semibold">Test Results:</h4>
          <div className="bg-gray-100 p-2 text-xs rounded max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}