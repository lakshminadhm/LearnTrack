import React, { useState, useEffect } from 'react';
import { BiPencil, BiRefresh, BiCheck, BiTrash } from 'react-icons/bi';
import { Goal, GoalStatus } from '../../types';

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, onDelete, isLoading }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredGoals = goals
    .filter(goal => {
      // Apply status filter
      if (statusFilter !== 'all') {
        return goal.status === statusFilter;
      }
      return true;
    })
    .filter(goal => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          goal.title.toLowerCase().includes(searchLower) ||
          goal.technology.toLowerCase().includes(searchLower) ||
          goal.description.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    // Sort by target date (closest first)
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());

  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.NOT_STARTED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Circle className="w-3 h-3 mr-1" />
          Not Started
        </span>;
      case GoalStatus.IN_PROGRESS:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </span>;
      case GoalStatus.COMPLETED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>;
      default:
        return null;
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600">Overdue by {Math.abs(diffDays)} day(s)</span>;
    } else if (diffDays === 0) {
      return <span className="text-amber-600">Due today</span>;
    } else {
      return <span>{diffDays} day(s) remaining</span>;
    }
  };
  
  return (
    <div className="dark:bg-surface-dark p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Learning Goals</h3>
      
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-surface-dark w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dark:bg-surface-dark block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:text-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value={GoalStatus.NOT_STARTED}>Not Started</option>
            <option value={GoalStatus.IN_PROGRESS}>In Progress</option>
            <option value={GoalStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      </div>
      
      {filteredGoals.length > 0 ? (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const isOverdue = new Date(goal.target_date).getTime() < new Date().setHours(0, 0, 0, 0) && 
                             goal.status !== GoalStatus.COMPLETED;
            
            return (
              <div 
                key={goal.id} 
                className={`border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'} 
                          ${goal.status === GoalStatus.COMPLETED ? 'bg-green-50' : ''} 
                          rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <div className="ml-2">{getStatusBadge(goal.status)}</div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-600">{goal.technology}</span>
                      <span className="text-gray-400">•</span>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(goal.target_date).toLocaleDateString()} 
                        <span className="ml-1 text-xs">({getDaysRemaining(goal.target_date)})</span>
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-gray-600 mt-1 text-sm">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(goal)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this goal?')) {
                          onDelete(goal.id);
                        }
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No goals found</p>
          {searchTerm || statusFilter !== 'all' ? (
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Start by creating your first learning goal!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(GoalList);