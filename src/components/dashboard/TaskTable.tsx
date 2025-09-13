'use client';

import React, { useState } from 'react';
import { Task, Progress, TaskStatus } from '@/types';

interface TaskTableProps {
  tasks: Task[];
  progress: Progress[];
  onProgressUpdate: (taskId: string, status: TaskStatus, memo?: string) => void;
  onTaskDelete?: (taskId: string, taskTitle: string) => void;
  onTaskUpdate?: (taskId: string, updates: { title: string; memo?: string }) => void;
  currentOrgId?: string;
}

export default function TaskTable({ tasks, progress, onProgressUpdate, onTaskDelete, onTaskUpdate, currentOrgId }: TaskTableProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [memoValues, setMemoValues] = useState<{ [key: string]: string }>({});
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskValues, setEditingTaskValues] = useState<{ [key: string]: { title: string; memo?: string } }>({});

  const getTaskProgress = (taskId: string): Progress | undefined => {
    return progress.find(p => p.taskId === taskId);
  };


  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    // ステータス変更時はメモを送らない（重複履歴・不要書き込み防止）
    await onProgressUpdate(taskId, status);
  };

  const handleMemoEdit = (taskId: string) => {
    // タスク編集中の場合は先にキャンセル
    if (editingTask === taskId) {
      handleTaskCancel(taskId);
    }
    
    const currentProgress = getTaskProgress(taskId);
    setMemoValues({
      ...memoValues,
      [taskId]: currentProgress?.memo || ''
    });
    setEditingMemo(taskId);
  };

  const handleMemoSave = async (taskId: string) => {
    try {
      const currentProgress = getTaskProgress(taskId);
      const currentStatus = currentProgress?.status || '未着手';
      
      await onProgressUpdate(taskId, currentStatus, memoValues[taskId] || '');
      setEditingMemo(null);
      // 保存後もメモ値を保持
    } catch (error) {
      console.error('Failed to save memo:', error);
      alert('連絡事項の保存に失敗しました');
    }
  };

  const handleMemoCancel = (taskId: string) => {
    setEditingMemo(null);
    setMemoValues({
      ...memoValues,
      [taskId]: ''
    });
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleTaskEdit = (task: Task) => {
    // メモ編集中の場合は先にキャンセル
    if (editingMemo === task.id) {
      handleMemoCancel(task.id);
    }
    
    setEditingTaskValues({
      ...editingTaskValues,
      [task.id]: {
        title: task.title,
        memo: task.memo || ''
      }
    });
    setEditingTask(task.id);
  };

  const handleTaskSave = async (taskId: string) => {
    if (!onTaskUpdate) return;

    try {
      const updates = editingTaskValues[taskId];
      if (updates) {
        await onTaskUpdate(taskId, updates);
      }
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('タスクの保存に失敗しました');
    }
  };

  const handleTaskCancel = (taskId: string) => {
    setEditingTask(null);
    setEditingTaskValues({
      ...editingTaskValues,
      [taskId]: { title: '', memo: '' }
    });
  };

  const canEditTask = (task: Task): boolean => {
    // ローカルタスクは作成者のみ、共通タスクは中央のみ編集可能
    return (task.kind === 'local' && task.createdByOrgId === currentOrgId) || 
           (task.kind === 'common' && currentOrgId === 'org_000');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タスク
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                完了日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => {
              const taskProgress = getTaskProgress(task.id);
              const currentStatus = taskProgress?.status || '未着手';
              
              return (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      {editingTask === task.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingTaskValues[task.id]?.title || ''}
                            onChange={(e) => setEditingTaskValues({
                              ...editingTaskValues,
                              [task.id]: {
                                ...editingTaskValues[task.id],
                                title: e.target.value
                              }
                            })}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="タスクタイトル"
                            maxLength={100}
                          />
                          <textarea
                            value={editingTaskValues[task.id]?.memo || ''}
                            onChange={(e) => setEditingTaskValues({
                              ...editingTaskValues,
                              [task.id]: {
                                ...editingTaskValues[task.id],
                                memo: e.target.value
                              }
                            })}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="メモ（任意）"
                            rows={2}
                            maxLength={200}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          {task.memo && (
                            <div className="text-sm text-gray-500 mt-1">{task.memo}</div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.kind === 'common' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {task.kind === 'common' ? '共通' : 'ローカル'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {taskProgress?.completedAt || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {/* 連絡事項ボタンは常に表示 */}
                      <button
                        onClick={() => toggleTaskExpansion(task.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium text-left"
                      >
                        {expandedTask === task.id ? '連絡事項を閉じる' : '中央への連絡事項を入力・編集'}
                      </button>
                      
                      {/* タスク編集・削除ボタン */}
                      {editingTask === task.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTaskSave(task.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => handleTaskCancel(task.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          {/* Show edit button: local tasks by creator, common tasks by central */}
                          {onTaskUpdate && canEditTask(task) && (
                            <button
                              onClick={() => handleTaskEdit(task)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                              編集
                            </button>
                          )}
                          {/* Show delete button: local tasks by creator, common tasks by central */}
                          {onTaskDelete && canEditTask(task) && (
                            <button
                              onClick={() => onTaskDelete(task.id, task.title)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                {/* Expanded Task Details for this specific task */}
                {expandedTask === task.id && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">タスク詳細: {task.title}</h4>
                          
                          {/* Communication Section */}
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center mb-2">
                              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                              </svg>
                              <label className="text-sm font-medium text-blue-800">中央への連絡・報告</label>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">進捗状況や課題があれば中央本部にお知らせください</p>
                            {editingMemo === task.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={memoValues[task.id] || ''}
                                  onChange={(e) => setMemoValues({ ...memoValues, [task.id]: e.target.value })}
                                  maxLength={200}
                                  rows={4}
                                  className="w-full text-sm p-3 border-2 border-blue-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                  placeholder="例：作業に遅れが生じています / 追加の資料が必要です / 順調に進んでいます"
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-blue-600">
                                    {(memoValues[task.id] || '').length}/200文字
                                  </span>
                                  <div className="space-x-2">
                                    <button
                                      onClick={() => handleMemoSave(task.id)}
                                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium shadow-sm"
                                    >
                                      📤 中央に送信
                                    </button>
                                    <button
                                      onClick={() => handleMemoCancel(task.id)}
                                      className="text-sm bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400"
                                    >
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-sm text-gray-700 min-h-[60px] p-3 bg-white border border-blue-200 rounded-md shadow-sm">
                                  {getTaskProgress(task.id)?.memo || (
                                    <span className="text-gray-500 italic">まだ連絡事項はありません</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleMemoEdit(task.id)}
                                  className="inline-flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                  </svg>
                                  中央に連絡・報告する
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Memo History */}
                          {getTaskProgress(task.id)?.memoHistory && getTaskProgress(task.id)!.memoHistory.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                連絡履歴 ({getTaskProgress(task.id)!.memoHistory.filter(h => h.memo.trim()).length})
                              </h5>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {getTaskProgress(task.id)!.memoHistory.filter(h => h.memo.trim()).slice().reverse().map((history, index) => (
                                  <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-200">
                                    <p className="text-sm text-gray-700">{history.memo}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(history.timestamp).toLocaleString('ja-JP')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {tasks.map((task) => {
          const taskProgress = getTaskProgress(task.id);
          const currentStatus = taskProgress?.status || '未着手';
          
          return (
            <div key={task.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingTaskValues[task.id]?.title || ''}
                        onChange={(e) => setEditingTaskValues({
                          ...editingTaskValues,
                          [task.id]: {
                            ...editingTaskValues[task.id],
                            title: e.target.value
                          }
                        })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="タスクタイトル"
                        maxLength={100}
                      />
                      <textarea
                        value={editingTaskValues[task.id]?.memo || ''}
                        onChange={(e) => setEditingTaskValues({
                          ...editingTaskValues,
                          [task.id]: {
                            ...editingTaskValues[task.id],
                            memo: e.target.value
                          }
                        })}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="メモ（任意）"
                        rows={2}
                        maxLength={200}
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                      {task.memo && (
                        <p className="text-sm text-gray-600 mt-1">{task.memo}</p>
                      )}
                    </>
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  task.kind === 'common' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {task.kind === 'common' ? '共通' : 'ローカル'}
                </span>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="未着手">未着手</option>
                  <option value="進行中">進行中</option>
                  <option value="完了">完了</option>
                </select>
              </div>

              {taskProgress?.completedAt && (
                <p className="text-xs text-gray-500 mb-3">完了日: {taskProgress.completedAt}</p>
              )}

              <div className="flex flex-col space-y-2">
                {/* 連絡事項ボタンは常に表示 */}
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium text-left"
                >
                  {expandedTask === task.id ? '連絡事項を閉じる' : '中央への連絡事項を入力・編集'}
                </button>
                
                {/* タスク編集・削除ボタン */}
                {editingTask === task.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTaskSave(task.id)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => handleTaskCancel(task.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-1">
                    {/* Show edit button: local tasks by creator, common tasks by central */}
                    {onTaskUpdate && canEditTask(task) && (
                      <button
                        onClick={() => handleTaskEdit(task)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium text-left"
                      >
                        タスクを編集
                      </button>
                    )}
                    {/* Show delete button: local tasks by creator, common tasks by central */}
                    {onTaskDelete && canEditTask(task) && (
                      <button
                        onClick={() => onTaskDelete(task.id, task.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium text-left"
                      >
                        削除
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Task Details for mobile */}
              {expandedTask === task.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 mt-3">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">タスク詳細: {task.title}</h4>
                    
                    {/* Communication Section - Mobile */}
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                        </svg>
                        <label className="text-sm font-medium text-blue-800">中央への連絡・報告</label>
                      </div>
                      <p className="text-xs text-blue-700 mb-3">進捗状況や課題があれば中央本部にお知らせください</p>
                      {editingMemo === task.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={memoValues[task.id] || ''}
                            onChange={(e) => setMemoValues({ ...memoValues, [task.id]: e.target.value })}
                            maxLength={200}
                            rows={4}
                            className="w-full text-sm p-3 border-2 border-blue-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="例：作業に遅れが生じています / 追加の資料が必要です / 順調に進んでいます"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600">
                              {(memoValues[task.id] || '').length}/200文字
                            </span>
                            <div className="space-x-2">
                              <button
                                onClick={() => handleMemoSave(task.id)}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 font-medium"
                              >
                                📤 送信
                              </button>
                              <button
                                onClick={() => handleMemoCancel(task.id)}
                                className="text-sm bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 min-h-[50px] p-3 bg-white border border-blue-200 rounded-md shadow-sm">
                            {getTaskProgress(task.id)?.memo || (
                              <span className="text-gray-500 italic">まだ連絡事項はありません</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleMemoEdit(task.id)}
                            className="inline-flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 font-medium"
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                            </svg>
                            中央に連絡する
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Memo History */}
                    {getTaskProgress(task.id)?.memoHistory && getTaskProgress(task.id)!.memoHistory.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          連絡履歴 ({getTaskProgress(task.id)!.memoHistory.filter(h => h.memo.trim()).length})
                        </h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {getTaskProgress(task.id)!.memoHistory.filter(h => h.memo.trim()).slice().reverse().map((history, index) => (
                            <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-200">
                              <p className="text-sm text-gray-700">{history.memo}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(history.timestamp).toLocaleString('ja-JP')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
