'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { Task, Progress, TaskStatus, TaskCategory } from '@/types';
import TaskCard from './TaskCard';
import TaskTable from './TaskTable';
import LocalTaskForm from './LocalTaskForm';

export default function TaskManagement() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.orgId) return;

    setIsLoading(true);
    try {
      // 共通タスク（該当カテゴリ）とローカルタスクを取得
      const [commonTasks, localTasks, progressData] = await Promise.all([
        FirestoreService.getTasksByCategory(user.role as TaskCategory),
        FirestoreService.getTasksByOrganization(user.orgId),
        FirestoreService.getProgressByOrganization(user.orgId)
      ]);

      const allTasks = [...commonTasks, ...localTasks];
      setTasks(allTasks);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProgressUpdate = async (taskId: string, status: TaskStatus, memo?: string) => {
    if (!user?.orgId) return;

    try {
      await FirestoreService.createOrUpdateProgress(taskId, user.orgId, status, memo);
      await loadData(); // データを再読み込み
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('進捗の更新に失敗しました');
    }
  };

  const handleTaskDelete = async (taskId: string, taskTitle: string) => {
    if (!confirm(`「${taskTitle}」を削除しますか？関連する進捗データも削除されます。`)) {
      return;
    }

    try {
      await FirestoreService.deleteTask(taskId);
      await loadData(); // データを再読み込み
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  const handleTaskCreated = () => {
    setShowNewTaskForm(false);
    loadData();
  };

  const getTaskProgress = (taskId: string): Progress | undefined => {
    return progress.find(p => p.taskId === taskId);
  };

  // タスクをステータス別に分類（カンバン用）
  const tasksByStatus = {
    '未着手': tasks.filter(task => {
      const prog = getTaskProgress(task.id);
      return !prog || prog.status === '未着手';
    }),
    '進行中': tasks.filter(task => {
      const prog = getTaskProgress(task.id);
      return prog?.status === '進行中';
    }),
    '完了': tasks.filter(task => {
      const prog = getTaskProgress(task.id);
      return prog?.status === '完了';
    })
  };

  // レスポンシブ対応: スマホではテーブル、PC・タブレットではカンバン
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile && viewMode === 'kanban') {
        setViewMode('table');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-gray-600">
            総タスク数: {tasks.length} | 
            完了: {tasksByStatus['完了'].length} | 
            進行中: {tasksByStatus['進行中'].length} | 
            未着手: {tasksByStatus['未着手'].length}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* View Mode Toggle (PC/Tablet only) */}
          {!isMobile && (
            <>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                テーブル
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                カンバン
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            ローカルタスク追加
          </button>
        </div>
      </div>

      {/* New Local Task Form */}
      {showNewTaskForm && (
        <LocalTaskForm
          onSubmit={handleTaskCreated}
          onCancel={() => setShowNewTaskForm(false)}
        />
      )}

      {/* Task Display */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">タスクがありません</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' || isMobile ? (
            <TaskTable
              tasks={tasks}
              progress={progress}
              onProgressUpdate={handleProgressUpdate}
              onTaskDelete={handleTaskDelete}
              currentOrgId={user?.orgId || ''}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['未着手', '進行中', '完了'] as TaskStatus[]).map(status => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    {status}
                    <span className="ml-2 bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
                      {tasksByStatus[status].length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {tasksByStatus[status].map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        progress={getTaskProgress(task.id)}
                        onProgressUpdate={handleProgressUpdate}
                        onTaskDelete={handleTaskDelete}
                        currentOrgId={user?.orgId || ''}
                      />
                    ))}
                    {tasksByStatus[status].length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        タスクなし
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}