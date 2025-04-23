import React, { useState, useEffect } from 'react';
import { Log, LogCreate } from '../../../../shared/src/types';

interface LogFormProps {
  onSubmit: (data: LogCreate) => Promise<boolean>;
  initialData?: Log;
  isLoading: boolean;
  onCancel?: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading,
  onCancel 
}) => {
  const [formData, setFormData] = useState<LogCreate>({
    date: new Date().toISOString().split('T')[0],
    technology: '',
    hours_spent: 0,
    notes: ''
  });

  // Popular technologies list for suggestions
  const technologies = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
    'Node.js', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Ruby',
    'PHP', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'GraphQL', 'Flutter'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        technology: initialData.technology,
        hours_spent: initialData.hours_spent,
        notes: initialData.notes
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours_spent' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    
    if (success && !initialData) {
      // Reset form if it's a new log and submission was successful
      setFormData({
        date: new Date().toISOString().split('T')[0],
        technology: '',
        hours_spent: 0,
        notes: ''
      });
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-md text-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {initialData ? 'Edit Learning Log' : 'Create New Learning Log'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="mt-1 block bg-inherit w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="technology" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technology
            </label>
            <input
              type="text"
              id="technology"
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              list="tech-options"
              required
              className="mt-1 block w-full border bg-inherit border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., React, Python, AWS"
            />
            <datalist id="tech-options">
              {technologies.map((tech) => (
                <option key={tech} value={tech} />
              ))}
            </datalist>
          </div>
        </div>
        
        <div>
          <label htmlFor="hours_spent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hours Spent
          </label>
          <input
            type="number"
            id="hours_spent"
            name="hours_spent"
            value={formData.hours_spent}
            onChange={handleChange}
            min="0.1"
            step="0.1"
            required
            className="mt-1 block bg-inherit w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter hours spent learning"
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-inherit mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block bg-inherit w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="What did you learn? Any challenges or achievements?"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Log' : 'Create Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;