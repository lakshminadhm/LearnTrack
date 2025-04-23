import React, { useState } from 'react';
import { Log } from '../../../../shared/src/types';
import { Edit, Trash2, Calendar, Code, Clock } from 'lucide-react';

interface LogListProps {
  logs: Log[];
  onEdit: (log: Log) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const LogList: React.FC<LogListProps> = ({ logs = [], onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredLogs = (logs || [])
    .filter(log => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          log.technology.toLowerCase().includes(searchLower) ||
          log.notes.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 ">Your Learning Logs</h3>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search logs by technology or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 dark:text-gray-100"
        />
      </div>
      
      {filteredLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors duration-300"
            >
              <div className="flex justify-between items-start bg-white">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-2">
                    <Code className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium text-gray-900">{log.technology}</h4>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                    <span className="text-gray-400">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{log.hours_spent} hours</span>
                  </div>
                  {log.notes && (
                    <p className="text-gray-600 mt-1 text-sm">{log.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(log)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this log?')) {
                        onDelete(log.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No logs found</p>
          {searchTerm ? (
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Start by creating your first learning log!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(LogList);