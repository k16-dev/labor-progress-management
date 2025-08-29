'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { TaskCategory } from '@/types';

interface LocalTaskFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export default function LocalTaskForm({ onSubmit, onCancel }: LocalTaskFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.orgId || !user?.role) {
      setError('ユーザー情報が不正です');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const now = new Date().toISOString().split('T')[0];
      // ローカルタスクは作成順（現在時刻ベース）で表示順を設定
      const displayOrder = Date.now();
      
      await FirestoreService.createTask({
        title: title.trim(),
        category: user.role as TaskCategory,
        kind: 'local',
        createdByOrgId: user.orgId,
        active: true,
        memo: '',
        displayOrder,
        createdAt: now,
        updatedAt: now
      });

      onSubmit();
    } catch (error) {
      console.error('Failed to create local task:', error);
      setError('タスクの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = () => {
    switch (user?.role) {
      case 'block': return 'ブロック';
      case 'branch': return '支部';
      case 'sub': return '分会';
      default: return '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        新規ローカルタスク作成 ({getCategoryLabel()})
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル *
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="タスクのタイトルを入力してください"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">{title.length}/100文字</p>
        </div>


        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>カテゴリ:</strong> {getCategoryLabel()}<br />
            <strong>種別:</strong> ローカル<br />
            <strong>作成者:</strong> {user?.orgName}
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '作成中...' : '作成'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}