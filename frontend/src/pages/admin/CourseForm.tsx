import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { useCourses } from '../../hooks/useCourses';
import { CourseDifficulty, AdminCourseCreate, Course } from '../../types';

const CourseForm: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, createCourse, updateCourse, getCourseById, isLoading, fetchCourses } = useAdmin();
  const { tracks } = useCourses();
  
  // Get trackId from URL query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const preSelectedTrackId = queryParams.get('trackId');
  
  const [formData, setFormData] = useState<AdminCourseCreate>({
    track_id: preSelectedTrackId || '',
    title: '',
    description: '',
    duration_hours: 0,
    difficulty: CourseDifficulty.BEGINNER
  });
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [formInitialized, setFormInitialized] = useState<boolean>(false);

  const isEditMode = !!courseId;

  // First ensure courses are loaded
  useEffect(() => {
    const loadData = async () => {
      if (isEditMode && (!courses || courses.length === 0)) {
        console.log('Fetching courses for edit mode...');
        await fetchCourses();
      }
      setInitialLoading(false);
    };

    loadData();
  }, [isEditMode, fetchCourses]);

  // Then populate form with course data once courses are loaded
  useEffect(() => {
    // Skip if already initialized or still loading
    if (formInitialized || initialLoading) {
      return;
    }
    
    if (isEditMode && courseId) {
      const course = getCourseById(courseId);
      if (course) {
        console.log('Found course for editing:', course.title);
        setFormData({
          track_id: course.track_id,
          title: course.title,
          description: course.description,
          duration_hours: course.duration_hours,
          difficulty: course.difficulty
        });
      } else {
        console.log('Course not found with ID:', courseId);
        if (courses && courses.length > 0) {
          console.log('Available course IDs:', courses.map(c => c.id));
          // Only navigate away if we have courses but couldn't find the one we want
          navigate('/admin/courses');
        }
      }
    }
    // Mark as initialized to prevent multiple attempts
    setFormInitialized(true);
  }, [courseId, getCourseById, isEditMode, navigate, courses, initialLoading, formInitialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === 'duration_hours' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (isEditMode && courseId) {
      success = await updateCourse({
        id: courseId,
        ...formData
      });
    } else {
      success = await createCourse(formData);
    }
    
    if (success) {
      navigate('/admin/courses');
    }
  };

  const handleCancel = () => {
    navigate('/admin/courses');
  };
  
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="track_id" className="block text-sm font-medium text-gray-700 mb-1">
              Learning Track
            </label>
            <select
              id="track_id"
              name="track_id"
              value={formData.track_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the course content and learning objectives..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                id="duration_hours"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleChange}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.values(CourseDifficulty).map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;