'use client';

import { useState } from 'react';
import { Task, Progress, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  progress?: Progress;
  onProgressUpdate: (taskId: string, status: TaskStatus, memo?: string) => void;
  onTaskDelete?: (taskId: string, taskTitle: string) => void;
  currentOrgId?: string;
}

export default function TaskCard({ task, progress, onProgressUpdate, onTaskDelete, currentOrgId }: TaskCardProps) {
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState(progress?.memo || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case '未着手': return 'bg-gray-100 text-gray-800';
      case '進行中': return 'bg-yellow-100 text-yellow-800';
      case '完了': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      // ステータス更新時は、memoが変更されている場合のみ送信
      const shouldUpdateMemo = memo !== (progress?.memo || '');
      await onProgressUpdate(task.id, newStatus, shouldUpdateMemo ? memo : undefined);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMemoUpdate = async () => {
    setIsUpdating(true);
    try {
      const currentTaskStatus = progress?.status || '未着手';
      await onProgressUpdate(task.id, currentTaskStatus, memo);
      setShowMemo(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatus = progress?.status || '未着手';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Task Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            task.kind === 'common' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {task.kind === 'common' ? '共通' : 'ローカル'}
          </span>
        </div>
        
        {task.memo && (
          <p className="text-xs text-gray-600 mb-2">{task.memo}</p>
        )}
      </div>

      {/* Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 mr-2">ステータス:</span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusUpdate(e.target.value as TaskStatus)}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${getStatusColor(currentStatus)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
          >
            <option value="未着手">未着手</option>
            <option value="進行中">進行中</option>
            <option value="完了">完了</option>
          </select>
        </div>
        {progress?.completedAt && (
          <p className="text-xs text-gray-500 mt-1">完了日: {progress.completedAt}</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Delete Button */}
        {onTaskDelete && (task.kind === 'local' || (task.kind === 'common' && currentOrgId === 'org_000')) && (
          <div className="pb-2 border-b border-gray-100">
            <button
              onClick={() => onTaskDelete(task.id, task.title)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              タスクを削除
            </button>
          </div>
        )}

        {/* Communication Section */}
        <div>
          <button
            onClick={() => setShowMemo(!showMemo)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showMemo ? '連絡事項を閉じる' : '中央への連絡事項を入力・編集'}
          </button>
          
          {showMemo && (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-gray-600 mb-1">
                中央への連絡事項があれば記入してください
              </div>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full text-xs p-3 border-2 border-blue-300 bg-blue-50 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                placeholder="連絡事項を入力してください（200文字以内）"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{memo.length}/200文字</span>
                <div className="space-x-1">
                  <button
                    onClick={handleMemoUpdate}
                    disabled={isUpdating}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setShowMemo(false);
                      setMemo(progress?.memo || '');
                    }}
                    className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Communication History */}
        {progress?.memoHistory && progress.memoHistory.filter(h => h.memo.trim()).length > 0 && (
          <details className="text-xs">
            <summary className="text-blue-600 cursor-pointer hover:text-blue-800">
              連絡履歴 ({progress.memoHistory.filter(h => h.memo.trim()).length})
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {progress.memoHistory
                .filter(h => h.memo.trim()) // 空のメモを除外
                .slice().reverse().map((history, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                  <p className="text-gray-700">{history.memo}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(history.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}