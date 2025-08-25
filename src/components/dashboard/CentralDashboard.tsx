'use client';

import { useState, useEffect, useCallback } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Organization, Task, Progress, ProgressSummary, TaskCategory } from '@/types';
import TaskManagementPanel from './TaskManagementPanel';
import TaskDetailsView from './TaskDetailsView';

type TabType = 'overview' | 'details' | 'management';

export default function CentralDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [progressSummaries, setProgressSummaries] = useState<ProgressSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('block');
  const [isLoading, setIsLoading] = useState(true);

  const calculateProgressSummaries = useCallback((orgs: Organization[], tasks: Task[], progress: Progress[]) => {
    const summaries: ProgressSummary[] = [];

    orgs.forEach(org => {
      if (org.role === 'central') return;

      // 対象タスクを取得（共通タスク + ローカルタスク）
      const applicableTasks = tasks.filter(task => 
        task.active && (
          (task.kind === 'common' && task.category === org.role) ||
          (task.kind === 'local' && task.createdByOrgId === org.id)
        )
      );

      // 完了済みタスク数を計算
      const completedTasks = progress.filter(p => 
        p.orgId === org.id && 
        p.status === '完了' &&
        applicableTasks.some(t => t.id === p.taskId)
      ).length;

      const progressRate = applicableTasks.length > 0 
        ? Math.round((completedTasks / applicableTasks.length) * 100 * 10) / 10 
        : 0;

      summaries.push({
        orgId: org.id,
        orgName: org.name,
        totalTasks: applicableTasks.length,
        completedTasks,
        progressRate
      });
    });

    setProgressSummaries(summaries);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orgsData, tasksData, progressData] = await Promise.all([
        FirestoreService.getOrganizations(),
        FirestoreService.getTasks(),
        FirestoreService.getProgress()
      ]);
      
      setOrganizations(orgsData);
      setTasks(tasksData);
      setProgress(progressData);
      
      // 進捗集計を計算
      calculateProgressSummaries(orgsData, tasksData, progressData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateProgressSummaries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSummaries = progressSummaries.filter(summary => {
    const org = organizations.find(o => o.id === summary.orgId);
    return org?.role === selectedCategory;
  });

  const handleTaskCreated = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            進捗一覧
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            タスク詳細
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'management'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            管理
          </button>
        </nav>
      </div>

      {/* Category Filter for Overview and Details */}
      {(activeTab === 'overview' || activeTab === 'details') && (
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedCategory('block')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === 'block'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ブロック
          </button>
          <button
            onClick={() => setSelectedCategory('branch')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === 'branch'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            支部
          </button>
          <button
            onClick={() => setSelectedCategory('sub')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCategory === 'sub'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            分会
          </button>
        </div>
      )}

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {selectedCategory === 'block' ? 'ブロック' : 
               selectedCategory === 'branch' ? '支部' : '分会'}進捗一覧
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      組織名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      総タスク数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完了数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗率
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSummaries.map((summary) => (
                    <tr key={summary.orgId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {summary.orgName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.completedTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${summary.progressRate}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-medium">{summary.progressRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-6">
            <TaskDetailsView
              organizations={organizations}
              tasks={tasks}
              progress={progress}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {activeTab === 'management' && (
          <div className="p-6">
            <TaskManagementPanel 
              tasks={tasks.filter(t => t.kind === 'common')}
              onTaskCreated={handleTaskCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}