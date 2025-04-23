import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Streak } from '../../../../shared/src/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StreakChartProps {
  streak: Streak | null;
  isLoading: boolean;
}

const StreakChart: React.FC<StreakChartProps> = ({ streak, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-md flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!streak || !streak.dates || streak.dates.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-md dark:bg-gray-900 dark:text-gray-100 ">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Learning Streak</h3>
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <p>No streak data available yet.</p>
          <p className="text-sm mt-2">Start logging your daily learning to see your streak!</p>
        </div>
      </div>
    );
  }

  // Get last 30 days of streak data or less if not available
  const dates = streak.dates.slice(-30);
  
  // Create consecutive days markers (1 if logged, 0 if not)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  
  const dateLabels: string[] = [];
  const streakData: number[] = [];
  
  // Generate all dates for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dateLabels.push(dateStr.slice(5)); // Format as MM-DD
    
    // Check if this date is in the streak dates
    streakData.push(dates.includes(dateStr) ? 1 : 0);
  }

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Daily Learning',
        data: streakData,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.1,
        fill: false,
        stepped: true
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1.2,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return value === 0 ? 'No' : value === 1 ? 'Yes' : '';
          }
        },
        title: {
          display: true,
          text: 'Learning Logged'
        }
      },
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y === 1 ? 'Logged learning activity' : 'No learning logged';
          }
        }
      }
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-xl transition-all border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Learning Streak</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{streak.current}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">{streak.longest}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Longest</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default React.memo(StreakChart);