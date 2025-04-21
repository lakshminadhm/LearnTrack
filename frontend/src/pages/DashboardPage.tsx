import React from 'react';
import StreakChart from '../components/Dashboard/StreakChart';
import ProgressSummary from '../components/Dashboard/ProgressSummary';
import TechBreakdown from '../components/Dashboard/TechBreakdown';
import { useAnalytics } from '../hooks/useAnalytics';

const DashboardPage: React.FC = () => {
  const { 
    streak, 
    progress, 
    techBreakdown, 
    isLoading, 
    fetchAllAnalytics 
  } = useAnalytics();

  React.useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Dashboard</h1>
        <button
          onClick={() => fetchAllAnalytics()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StreakChart streak={streak} isLoading={isLoading} />
        </div>
        <div>
          <TechBreakdown techData={techBreakdown} isLoading={isLoading} />
        </div>
      </div>

      <div>
        <ProgressSummary progress={progress} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardPage;