'use client';

import { useState, useEffect, useMemo } from 'react';
import { Organization, Task, Progress, TaskCategory, TaskStatus } from '@/types';

interface TaskDetailsViewProps {
  organizations: Organization[];
  tasks: Task[];
  progress: Progress[];
  selectedCategory: TaskCategory;
}

interface TaskDetail {
  taskId: string;
  taskTitle: string;
  taskMemo?: string;
  taskKind: 'common' | 'local';
  orgId: string;
  orgName: string;
  status: '未着手' | '進行中' | '完了';
  progressMemo?: string;
  completedAt?: string;
  updatedAt: string;
}

interface OrgSummary {
  orgId: string;
  orgName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export default function TaskDetailsView({ 
  organizations, 
  tasks, 
  progress, 
  selectedCategory 
}: TaskDetailsViewProps) {
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<TaskDetail[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | '未着手' | '進行中' | '完了'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const getCategoryLabel = (category: TaskCategory) => {
    switch (category) {
      case 'block': return 'ブロック';
      case 'branch': return '支部';
      case 'sub': return '分会';
      default: return '';
    }
  };

  const getStatusColor = (status: '未着手' | '進行中' | '完了') => {
    switch (status) {
      case '未着手': return 'bg-gray-100 text-gray-800';
      case '進行中': return 'bg-yellow-100 text-yellow-800';
      case '完了': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 組織別サマリー計算
  const orgSummaries = useMemo(() => {
    const categoryOrgs = organizations.filter(org => org.role === selectedCategory);
    const summaries: OrgSummary[] = [];

    categoryOrgs.forEach(org => {
      const orgTasks = taskDetails.filter(detail => detail.orgId === org.id);
      const completed = orgTasks.filter(t => t.status === '完了').length;
      const inProgress = orgTasks.filter(t => t.status === '進行中').length;
      const pending = orgTasks.filter(t => t.status === '未着手').length;
      const total = orgTasks.length;

      summaries.push({
        orgId: org.id,
        orgName: org.name,
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0
      });
    });

    return summaries.sort((a, b) => b.completionRate - a.completionRate);
  }, [taskDetails, organizations, selectedCategory]);

  useEffect(() => {
    const generateTaskDetails = () => {
      const details: TaskDetail[] = [];
      
      // カテゴリに該当する組織を取得
      const categoryOrgs = organizations.filter(org => org.role === selectedCategory);
      
      categoryOrgs.forEach(org => {
        // この組織に適用されるタスクを取得（共通タスク + ローカルタスク）
        const applicableTasks = tasks.filter(task => 
          task.active && (
            (task.kind === 'common' && task.category === selectedCategory) ||
            (task.kind === 'local' && task.createdByOrgId === org.id)
          )
        );

        applicableTasks.forEach(task => {
          // この組織・タスクの進捗を取得
          const taskProgress = progress.find(p => 
            p.taskId === task.id && p.orgId === org.id
          );

          details.push({
            taskId: task.id,
            taskTitle: task.title,
            taskMemo: task.memo,
            taskKind: task.kind,
            orgId: org.id,
            orgName: org.name,
            status: taskProgress?.status || '未着手',
            progressMemo: taskProgress?.memo,
            completedAt: taskProgress?.completedAt,
            updatedAt: taskProgress?.updatedAt || task.createdAt
          });
        });
      });

      // 更新日時で降順ソート
      details.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setTaskDetails(details);
    };

    generateTaskDetails();
  }, [organizations, tasks, progress, selectedCategory]);

  useEffect(() => {
    let filtered = taskDetails;

    // 組織フィルタ
    if (selectedOrgId !== 'all') {
      filtered = filtered.filter(detail => detail.orgId === selectedOrgId);
    }

    // ステータスフィルタ
    if (statusFilter !== 'all') {
      filtered = filtered.filter(detail => detail.status === statusFilter);
    }

    // 検索フィルタ
    if (searchQuery) {
      filtered = filtered.filter(detail => 
        detail.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        detail.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        detail.progressMemo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDetails(filtered);
    setCurrentPage(1); // フィルタ変更時はページを1に戻す
  }, [taskDetails, statusFilter, searchQuery, selectedOrgId]);

  // ページネーション計算
  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const paginatedDetails = filteredDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusCounts = {
    all: taskDetails.length,
    '未着手': taskDetails.filter(d => d.status === '未着手').length,
    '進行中': taskDetails.filter(d => d.status === '進行中').length,
    '完了': taskDetails.filter(d => d.status === '完了').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {getCategoryLabel(selectedCategory)}タスク詳細
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              全{organizations.filter(org => org.role === selectedCategory).length}組織 | 
              全{taskDetails.length}件のタスク
            </p>
          </div>

          {/* 表示モード切替 */}
          {(
            <div className="flex rounded-md bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  viewMode === 'summary'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                組織別集計
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                詳細一覧
              </button>
            </div>
          )}
        </div>

        {/* フィルタ・検索 */}
        {viewMode === 'detailed' && (
          <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
            {/* 組織選択 */}
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                全{selectedCategory === 'block' ? 'ブロック' : selectedCategory === 'branch' ? '支部' : '分会'}
              </option>
              {organizations
                .filter(org => org.role === selectedCategory)
                .map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))
              }
            </select>
            
            {/* ステータスフィルタ */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="min-w-[160px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全ステータス ({statusCounts.all})</option>
              <option value="未着手">未着手 ({statusCounts['未着手']})</option>
              <option value="進行中">進行中 ({statusCounts['進行中']})</option>
              <option value="完了">完了 ({statusCounts['完了']})</option>
            </select>

            {/* 検索 */}
            <input
              type="text"
              placeholder="タスク名・組織名・メモで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[300px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* コンテンツ表示 */}
      {viewMode === 'summary' ? (
        /* 組織別集計ビュー */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orgSummaries.map((summary) => (
            <div key={summary.orgId} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900 text-sm">{summary.orgName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  summary.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                  summary.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {summary.completionRate}%
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">総タスク</span>
                  <span className="font-medium">{summary.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">完了</span>
                  <span className="font-medium text-green-600">{summary.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">進行中</span>
                  <span className="font-medium text-yellow-600">{summary.inProgressTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">未着手</span>
                  <span className="font-medium text-gray-600">{summary.pendingTasks}</span>
                </div>
              </div>
              
              {/* プログレスバー */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${summary.completionRate}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedOrgId(summary.orgId);
                  setViewMode('detailed');
                }}
                className="mt-3 w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                詳細を表示
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* 詳細一覧ビュー */
        <>
          {filteredDetails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || selectedOrgId !== 'all'
                  ? '条件に該当するタスクがありません' 
                  : 'タスクがありません'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {paginatedDetails.map((detail) => (
                    <li key={`${detail.taskId}-${detail.orgId}`} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {detail.taskTitle}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              detail.taskKind === 'common' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {detail.taskKind === 'common' ? '共通' : 'ローカル'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(detail.status)}`}>
                              {detail.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {detail.orgName}
                            </span>
                            <span>更新日: {detail.updatedAt}</span>
                            {detail.completedAt && (
                              <span className="text-green-600">完了日: {detail.completedAt}</span>
                            )}
                          </div>

                          {detail.taskMemo && (
                            <p className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">タスク詳細:</span> {detail.taskMemo}
                            </p>
                          )}

                          {detail.progressMemo && (
                            <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium text-yellow-800">📝 連絡事項:</span> {detail.progressMemo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次へ
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                        〜
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDetails.length)}</span>
                        件 / 全
                        <span className="font-medium">{filteredDetails.length}</span>
                        件
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 統計情報 */}
      {viewMode === 'summary' && selectedCategory === 'sub' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{orgSummaries.length}</div>
            <div className="text-sm text-blue-800">分会数</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {orgSummaries.length > 0 
                ? Math.round((orgSummaries.reduce((sum, s) => sum + s.completionRate, 0) / orgSummaries.length) * 10) / 10 
                : 0}%
            </div>
            <div className="text-sm text-green-800">平均完了率</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {orgSummaries.filter(s => s.completionRate >= 80).length}
            </div>
            <div className="text-sm text-yellow-800">完了率80%以上</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {orgSummaries.reduce((sum, s) => sum + s.totalTasks, 0)}
            </div>
            <div className="text-sm text-gray-800">総タスク数</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.all}</div>
            <div className="text-sm text-blue-800">
              {selectedOrgId !== 'all' ? '該当組織タスク数' : '総タスク数'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{statusCounts['未着手']}</div>
            <div className="text-sm text-gray-800">未着手</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts['進行中']}</div>
            <div className="text-sm text-yellow-800">進行中</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{statusCounts['完了']}</div>
            <div className="text-sm text-green-800">完了</div>
          </div>
        </div>
      )}
    </div>
  );
}