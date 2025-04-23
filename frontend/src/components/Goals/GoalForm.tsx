import React, { useState, useEffect } from 'react';
import { Goal, GoalCreate, GoalStatus } from '../../../../shared/src/types';

interface GoalFormProps {
  onSubmit: (data: GoalCreate) => Promise<boolean>;
  initialData?: Goal;
  isLoading: boolean;
  onCancel?: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading,
  onCancel 
}) => {
  const [formData, setFormData] = useState<GoalCreate>({
    title: '',
    description: '',
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week from today
    technology: '',
    status: GoalStatus.NOT_STARTED,
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
        title: initialData.title,
        description: initialData.description,
        target_date: initialData.target_date,
        technology: initialData.technology,
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    
    if (success && !initialData) {
      // Reset form if it's a new goal and submission was successful
      setFormData({
        title: '',
        description: '',
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        technology: '',
        status: GoalStatus.NOT_STARTED,
      });
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 dark:text-gray-100 tracking-tight">
        {initialData ? 'Edit Learning Goal' : 'Create New Learning Goal'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">Goal Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="e.g., Master React Hooks" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="technology" className="block text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">Technology</label>
            <input type="text" id="technology" name="technology" value={formData.technology} onChange={handleChange} list="tech-options" required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="e.g., React, Python, AWS" />
            <datalist id="tech-options">{technologies.map((tech) => (<option key={tech} value={tech} />))}</datalist>
          </div>
          <div>
            <label htmlFor="target_date" className="block text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">Target Date</label>
            <input type="date" id="target_date" name="target_date" value={formData.target_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="What do you want to achieve? How will you measure success?"></textarea>
        </div>
        {initialData && (
          <div>
            <label htmlFor="status" className="block text-base font-semibold text-gray-700 mb-2 dark:text-gray-300">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <option value={GoalStatus.NOT_STARTED}>Not Started</option>
              <option value={GoalStatus.IN_PROGRESS}>In Progress</option>
              <option value={GoalStatus.COMPLETED}>Completed</option>
            </select>
          </div>
        )}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <button type="button" onClick={onCancel} className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-900 transition-colors">Cancel</button>
          )}
          <button type="submit" disabled={isLoading} className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors">{isLoading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}</button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;