'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ProgressSummary, TaskCategory } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartProps {
  summaries: ProgressSummary[];
  category: TaskCategory;
}

export default function ProgressChart({ summaries, category }: ProgressChartProps) {
  const getCategoryLabel = (category: TaskCategory) => {
    switch (category) {
      case 'block': return 'ブロック';
      case 'branch': return '支部';
      case 'sub': return '分会';
      default: return '';
    }
  };

  const data = {
    labels: summaries.map(s => s.orgName),
    datasets: [
      {
        label: '進捗率 (%)',
        data: summaries.map(s => s.progressRate),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${getCategoryLabel(category)}別進捗率`,
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataIndex: number; parsed: { y: number } }) {
            const summary = summaries[context.dataIndex];
            return [
              `進捗率: ${context.parsed.y}%`,
              `完了: ${summary.completedTasks}/${summary.totalTasks}タスク`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) {
            return value + '%';
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
  };

  if (summaries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">
        {getCategoryLabel(category)}別進捗率グラフ
      </h2>
      <div className="h-96 overflow-x-auto">
        <div style={{ minWidth: summaries.length > 10 ? `${summaries.length * 80}px` : '100%', height: '100%' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {summaries.length}
          </div>
          <div className="text-sm text-blue-800">
            {getCategoryLabel(category)}数
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {summaries.length > 0 
              ? Math.round((summaries.reduce((sum, s) => sum + s.progressRate, 0) / summaries.length) * 10) / 10 
              : 0}%
          </div>
          <div className="text-sm text-green-800">
            平均進捗率
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {summaries.reduce((sum, s) => sum + s.totalTasks, 0)}
          </div>
          <div className="text-sm text-yellow-800">
            総タスク数
          </div>
        </div>
      </div>
    </div>
  );
}