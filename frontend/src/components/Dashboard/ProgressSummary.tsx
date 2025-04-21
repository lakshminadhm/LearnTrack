import React from 'react';
import { Progress } from '../../../../shared/src/types';
import { Clock, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';

interface ProgressSummaryProps {
  progress: Progress | null;
  isLoading: boolean;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ progress, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Hours',
      value: progress?.total_hours || 0,
      icon: <Clock className="w-10 h-10 text-indigo-600" />,
      suffix: ' hrs',
      description: 'Time invested in learning',
    },
    {
      title: 'Total Logs',
      value: progress?.total_logs || 0,
      icon: <BookOpen className="w-10 h-10 text-emerald-600" />,
      suffix: '',
      description: 'Learning sessions recorded',
    },
    {
      title: 'Daily Average',
      value: progress?.total_logs ? +(progress.total_hours / progress.total_logs).toFixed(1) : 0,
      icon: <TrendingUp className="w-10 h-10 text-amber-600" />,
      suffix: ' hrs',
      description: 'Average time per session',
    },
    {
      title: 'Courses Completed',
      value: progress?.course_stats ? `${progress.course_stats.completed}/${progress.course_stats.total}` : '0/0',
      icon: <GraduationCap className="w-10 h-10 text-purple-600" />,
      suffix: '',
      description: 'Learning tracks progress',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Progress</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-300">
            <div className="mr-4">{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}{stat.suffix}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {progress && progress.recent_logs && progress.recent_logs.length > 0 ? (
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h4>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technology
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.technology}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.hours_spent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center p-6 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No recent learning logs available.</p>
          <p className="text-sm text-gray-400 mt-1">Start logging your daily learning activities!</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressSummary);