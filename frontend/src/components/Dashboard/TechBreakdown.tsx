import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { TechBreakdown as TechBreakdownType } from '../../../../shared/src/types';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface TechBreakdownProps {
  techData: TechBreakdownType[];
  isLoading: boolean;
}

// Generate colors based on technology name to ensure consistency
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'rgba(79, 70, 229, 0.8)', // Indigo
    'rgba(16, 185, 129, 0.8)', // Emerald
    'rgba(245, 158, 11, 0.8)', // Amber
    'rgba(239, 68, 68, 0.8)',  // Red
    'rgba(37, 99, 235, 0.8)',  // Blue
    'rgba(168, 85, 247, 0.8)', // Purple
    'rgba(236, 72, 153, 0.8)', // Pink
    'rgba(20, 184, 166, 0.8)', // Teal
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

const TechBreakdown: React.FC<TechBreakdownProps> = ({ techData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-80">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 w-64 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!techData || techData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Technology Breakdown</h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>No technology data available yet.</p>
          <p className="text-sm mt-2">Log your learning sessions to see your technology breakdown!</p>
        </div>
      </div>
    );
  }

  // Sort tech data by hours (descending)
  const sortedTechData = [...techData].sort((a, b) => b.hours - a.hours);
  
  const data = {
    labels: sortedTechData.map(tech => tech.technology),
    datasets: [
      {
        data: sortedTechData.map(tech => tech.hours),
        backgroundColor: sortedTechData.map(tech => generateColorFromString(tech.technology)),
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = sortedTechData[context.dataIndex].percentage;
            return `${label}: ${value} hours (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Technology Breakdown</h3>
      <div className="h-72">
        <Pie data={data} options={options} />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedTechData.slice(0, 4).map((tech, index) => (
          <div key={index} className="flex items-center py-2 px-3 rounded-md bg-gray-50">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: generateColorFromString(tech.technology) }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{tech.technology}</p>
            </div>
            <div className="flex-none">
              <p className="text-sm text-gray-500">{tech.hours} hrs ({tech.percentage.toFixed(1)}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(TechBreakdown);