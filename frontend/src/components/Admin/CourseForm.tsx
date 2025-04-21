import React, { useState, useEffect } from 'react';
import { Course, LearningTrack, AdminCourseCreate, CourseDifficulty } from '../../../../shared/src/types';

interface CourseFormProps {
  tracks: LearningTrack[];
  onSubmit: (data: AdminCourseCreate) => Promise<boolean>;
  initialData?: Course;
  isLoading: boolean;
  onCancel?: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  tracks,
  onSubmit,
  initialData,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<AdminCourseCreate>({
    track_id: '',
    title: '',
    description: '',
    duration_hours: 1,
    difficulty: CourseDifficulty.BEGINNER
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        track_id: initialData.track_id,
        title: initialData.title,
        description: initialData.description,
        duration_hours: initialData.duration_hours,
        difficulty: initialData.difficulty
      });
    } else if (tracks.length > 0) {
      setFormData(prev => ({ ...prev, track_id: tracks[0].id }));
    }
  }, [initialData, tracks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_hours' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    
    if (success && !initialData) {
      setFormData({
        track_id: tracks[0]?.id || '',
        title: '',
        description: '',
        duration_hours: 1,
        difficulty: CourseDifficulty.BEGINNER
      });
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">
        {initialData ? 'Edit Course' : 'Create New Course'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="track_id" className="block text-sm font-medium text-gray-300 mb-1">
            Learning Track
          </label>
          <select
            id="track_id"
            name="track_id"
            value={formData.track_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a track</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Course Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Introduction to React"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the course content and learning objectives..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-300 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              id="duration_hours"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-1">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.values(CourseDifficulty).map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;