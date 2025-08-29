'use client';

import { useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Task, TaskCategory } from '@/types';

interface TaskManagementPanelProps {
  tasks: Task[];
  onTaskCreated: () => void;
}

export default function TaskManagementPanel({ tasks, onTaskCreated }: TaskManagementPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'block' as TaskCategory,
    memo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [reorderingCategory, setReorderingCategory] = useState<TaskCategory | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskValues, setEditingTaskValues] = useState<{ [key: string]: { title: string; memo?: string } }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const now = new Date().toISOString().split('T')[0];
      // 現在の同カテゴリのタスク数を取得して次の表示順を決定
      const categoryTasks = tasks.filter(t => t.category === newTask.category && t.kind === 'common');
      const nextDisplayOrder = Math.max(0, ...categoryTasks.map(t => t.displayOrder || 0)) + 1;
      
      await FirestoreService.createTask({
        title: newTask.title,
        category: newTask.category,
        kind: 'common',
        createdByOrgId: 'org_000', // 中央のID
        active: true,
        memo: newTask.memo,
        displayOrder: nextDisplayOrder,
        createdAt: now,
        updatedAt: now
      });

      setNewTask({ title: '', category: 'block', memo: '' });
      setIsCreating(false);
      onTaskCreated();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('タスクの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('このタスクを削除しますか？関連する進捗データも削除されます。')) {
      return;
    }

    try {
      await FirestoreService.deleteTask(taskId);
      onTaskCreated(); // データを再読み込み
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  const handleTaskReorder = async (category: TaskCategory, reorderedTasks: Task[]) => {
    setReorderingCategory(category);
    
    try {
      // 表示順を再設定
      const taskOrderUpdates = reorderedTasks.map((task, index) => ({
        id: task.id,
        displayOrder: index + 1
      }));

      await FirestoreService.updateTaskOrder(taskOrderUpdates);
      onTaskCreated(); // データを再読み込み
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      alert('タスクの順序変更に失敗しました');
    } finally {
      setReorderingCategory(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string, category: TaskCategory) => {
    e.preventDefault();
    
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      return;
    }

    const categoryTasks = tasks
      .filter(t => t.category === category && t.kind === 'common')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const draggedIndex = categoryTasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = categoryTasks.findIndex(t => t.id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTaskId(null);
      return;
    }

    // タスクの順序を入れ替え
    const reorderedTasks = [...categoryTasks];
    const [draggedTask] = reorderedTasks.splice(draggedIndex, 1);
    reorderedTasks.splice(targetIndex, 0, draggedTask);

    handleTaskReorder(category, reorderedTasks);
    setDraggedTaskId(null);
  };

  const handleTaskEdit = (task: Task) => {
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
    try {
      const updates = editingTaskValues[taskId];
      if (updates) {
        await FirestoreService.updateTask(taskId, updates);
        onTaskCreated(); // データを再読み込み
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

  const getCategoryLabel = (category: TaskCategory) => {
    switch (category) {
      case 'block': return 'ブロック';
      case 'branch': return '支部';
      case 'sub': return '分会';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">共通タスク管理</h2>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          新規タスク追加
        </button>
      </div>

      {/* Create New Task Form */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">新規共通タスク</h3>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength={100}
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="タスクのタイトルを入力してください"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                カテゴリ *
              </label>
              <select
                id="category"
                required
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="block">ブロック</option>
                <option value="branch">支部</option>
                <option value="sub">分会</option>
              </select>
            </div>


            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? '作成中...' : '作成'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewTask({ title: '', category: 'block', memo: '' });
                  setError('');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category-based Task Lists */}
      <div className="space-y-6">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">共通タスクがありません</p>
        ) : (
          (['block', 'branch', 'sub'] as TaskCategory[]).map(category => {
            const categoryTasks = tasks
              .filter(t => t.category === category && t.kind === 'common')
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

            if (categoryTasks.length === 0) return null;

            return (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCategoryLabel(category)}向け共通タスク ({categoryTasks.length}件)
                  </h3>
                  {reorderingCategory === category && (
                    <div className="text-sm text-blue-600">順序変更中...</div>
                  )}
                </div>

                <div className="space-y-2">
                  {categoryTasks.map((task, index) => (
                    <div
                      key={task.id}
                      draggable={!reorderingCategory}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, task.id, category)}
                      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all ${
                        draggedTaskId === task.id ? 'opacity-50 scale-95' : 'hover:shadow-sm'
                      } ${!reorderingCategory ? 'cursor-move' : 'cursor-default'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {editingTask === task.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
                                <div className="w-1.5 h-4 bg-gray-300 rounded cursor-move"></div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  共通
                                </span>
                              </div>
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
                                className="w-full text-md font-medium border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="メモ（任意）"
                                rows={3}
                                maxLength={200}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
                                  <div className="w-1.5 h-4 bg-gray-300 rounded cursor-move"></div>
                                </div>
                                <h4 className="text-md font-medium text-gray-900">{task.title}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  共通
                                </span>
                              </div>
                              {task.memo && (
                                <p className="mt-2 text-sm text-gray-600">{task.memo}</p>
                              )}
                              <p className="mt-1 text-xs text-gray-500">
                                作成日: {task.createdAt} | 更新日: {task.updatedAt} | 表示順: {task.displayOrder || '未設定'}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          {editingTask === task.id ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleTaskEdit(task)}
                                disabled={!!reorderingCategory}
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                disabled={!!reorderingCategory}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                削除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}