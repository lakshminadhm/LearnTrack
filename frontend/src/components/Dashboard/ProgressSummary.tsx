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
      <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-900 dark:text-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded dark:bg-gray-800"></div>
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
    <div className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-xl transition-all border border-gray-100 dark:border-gray-800">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 dark:text-gray-100 tracking-tight">Your Progress</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-4 p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/70 shadow hover:shadow-lg transition-all group cursor-pointer">
            <div className="mr-2 scale-110 group-hover:scale-125 transition-transform duration-200">{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-sm dark:text-gray-400 font-medium">{stat.title}</p>
              <p className="text-3xl font-extrabold tracking-tight dark:text-gray-100 mb-1">{stat.value}{stat.suffix}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
      {progress && progress.recent_logs && progress.recent_logs.length > 0 ? (
        <div className="mt-10">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Recent Activity</h4>
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Technology</th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {progress.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-indigo-50 dark:hover:bg-gray-800/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">{log.technology}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{log.hours_spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center p-8 border-2 border-dashed border-gray-200 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No recent learning logs available.</p>
          <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">Start logging your daily learning activities!</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressSummary);