'use client';

import { useState } from 'react';
import { Task, Progress, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  progress?: Progress;
  onProgressUpdate: (taskId: string, status: TaskStatus, memo?: string) => void;
  onTaskDelete?: (taskId: string, taskTitle: string) => void;
  onTaskUpdate?: (taskId: string, updates: { title: string; memo?: string }) => void;
  currentOrgId?: string;
}

export default function TaskCard({ task, progress, onProgressUpdate, onTaskDelete, onTaskUpdate, currentOrgId }: TaskCardProps) {
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState(progress?.memo || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState(task.title);
  const [taskMemo, setTaskMemo] = useState(task.memo || '');

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

  const handleTaskEditStart = () => {
    setTaskTitle(task.title);
    setTaskMemo(task.memo || '');
    setIsEditingTask(true);
  };

  const handleTaskEditSave = async () => {
    if (!onTaskUpdate) return;

    setIsUpdating(true);
    try {
      await onTaskUpdate(task.id, {
        title: taskTitle,
        memo: taskMemo
      });
      setIsEditingTask(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('タスクの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTaskEditCancel = () => {
    setTaskTitle(task.title);
    setTaskMemo(task.memo || '');
    setIsEditingTask(false);
  };

  const canEditTask = (): boolean => {
    // ローカルタスクは作成者のみ、共通タスクは中央のみ編集可能
    return (task.kind === 'local' && task.createdByOrgId === currentOrgId) || 
           (task.kind === 'common' && currentOrgId === 'org_000');
  };

  const currentStatus = progress?.status || '未着手';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Task Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          {isEditingTask ? (
            <div className="flex-1 mr-2 space-y-2">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="タスクタイトル"
                maxLength={100}
                disabled={isUpdating}
              />
              <textarea
                value={taskMemo}
                onChange={(e) => setTaskMemo(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="メモ（任意）"
                rows={2}
                maxLength={200}
                disabled={isUpdating}
              />
            </div>
          ) : (
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
              {task.memo && (
                <p className="text-xs text-gray-600 mb-2">{task.memo}</p>
              )}
            </div>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            task.kind === 'common' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {task.kind === 'common' ? '共通' : 'ローカル'}
          </span>
        </div>
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
        {/* Task Edit Buttons */}
        {isEditingTask ? (
          <div className="pb-2 border-b border-gray-100">
            <div className="flex space-x-2">
              <button
                onClick={handleTaskEditSave}
                disabled={isUpdating || !taskTitle.trim()}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleTaskEditCancel}
                disabled={isUpdating}
                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Task Edit/Delete Buttons */}
            {(onTaskUpdate || onTaskDelete) && canEditTask() && (
              <div className="pb-2 border-b border-gray-100">
                <div className="flex space-x-2">
                  {onTaskUpdate && (
                    <button
                      onClick={handleTaskEditStart}
                      className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      タスクを編集
                    </button>
                  )}
                  {onTaskDelete && (
                    <button
                      onClick={() => onTaskDelete(task.id, task.title)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      タスクを削除
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Communication Section */}
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center mb-2">
            <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
            </svg>
            <span className="text-xs font-medium text-blue-800">中央への連絡・報告</span>
          </div>
          
          {showMemo ? (
            <div className="space-y-2">
              <div className="text-xs text-blue-700">
                進捗状況や課題があれば中央本部にお知らせください
              </div>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full text-xs p-3 border-2 border-blue-300 bg-white rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="例：作業に遅れが生じています / 追加の資料が必要です / 順調に進んでいます"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">{memo.length}/200文字</span>
                <div className="space-x-1">
                  <button
                    onClick={handleMemoUpdate}
                    disabled={isUpdating}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    📤 送信
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
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-700 min-h-[40px] p-2 bg-white border border-blue-200 rounded shadow-sm">
                {progress?.memo || (
                  <span className="text-gray-500 italic">まだ連絡事項はありません</span>
                )}
              </div>
              <button
                onClick={() => setShowMemo(true)}
                className="inline-flex items-center text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 font-medium"
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
                中央に連絡する
              </button>
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