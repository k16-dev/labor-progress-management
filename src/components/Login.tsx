'use client';

import { useState, useEffect } from 'react';
import { AuthService, AuthSession } from '@/lib/auth';
import { FirestoreService } from '@/lib/firestore';
import { Role, LoginData, Organization } from '@/types';

interface LoginProps {
  onLogin: (session: AuthSession) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loginData, setLoginData] = useState<LoginData>({
    role: 'central',
    password: ''
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await FirestoreService.getOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Failed to load organizations:', error);
      }
    };
    
    loadOrganizations();
  }, []);

  const handleRoleChange = (role: Role) => {
    setLoginData({
      role,
      password: '',
      orgId: undefined
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Login attempt:', { role: loginData.role, orgId: loginData.orgId });
      
      if (!AuthService.validateLogin(loginData)) {
        console.log('Validation failed');
        if (loginData.role === 'central') {
          setError('中央のパスワードが正しくありません（正解: 1050）');
        } else {
          setError('パスワードが正しくないか、組織が選択されていません（パスワード: 1234）');
        }
        setIsLoading(false);
        return;
      }

      let orgName = '';
      if (loginData.role === 'central') {
        orgName = '中央';
      } else if (loginData.orgId) {
        const org = organizations.find(o => o.id === loginData.orgId);
        orgName = org?.name || '';
        console.log('Found organization:', org);
      }

      const session = {
        role: loginData.role,
        orgId: loginData.orgId,
        orgName,
        isAuthenticated: true
      };

      console.log('Logging in with session:', session);
      setIsLoading(false);
      onLogin(session);
    } catch (error) {
      console.error('Login error:', error);
      setError('ログイン処理でエラーが発生しました: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(org => 
    org.role === loginData.role && org.role !== 'central'
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            統合進捗管理システム
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ログインしてください
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* 役割選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                役割
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="central"
                    checked={loginData.role === 'central'}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="mr-2"
                  />
                  中央
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="block"
                    checked={loginData.role === 'block'}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="mr-2"
                  />
                  ブロック
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="branch"
                    checked={loginData.role === 'branch'}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="mr-2"
                  />
                  支部
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="sub"
                    checked={loginData.role === 'sub'}
                    onChange={(e) => handleRoleChange(e.target.value as Role)}
                    className="mr-2"
                  />
                  分会
                </label>
              </div>
            </div>

            {/* 組織選択 */}
            {loginData.role !== 'central' && (
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  組織
                </label>
                <select
                  id="organization"
                  required
                  value={loginData.orgId || ''}
                  onChange={(e) => setLoginData({ ...loginData, orgId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">組織を選択してください</option>
                  {filteredOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="パスワードを入力してください"
              />
              <p className="mt-1 text-xs text-gray-500">
                {loginData.role === 'central' 
                  ? 'パスワードは管理者にお問い合わせください'
                  : 'パスワードは各組織の管理者にお問い合わせください'
                }
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}