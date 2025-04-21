import React, { useState } from 'react';
import { Course, LearningTrack, AdminCourseUpdate } from '../../../../shared/src/types';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface CourseListAdminProps {
  courses: Course[];
  tracks: LearningTrack[];
  onEdit: (data: AdminCourseUpdate) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const CourseListAdmin: React.FC<CourseListAdminProps> = ({
  courses,
  tracks,
  onEdit,
  onDelete,
  isLoading
}) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const handleEdit = async (course: Course) => {
    setEditingCourse(course);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await onDelete(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const getTrackTitle = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.title : 'Unknown Track';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-900 text-green-200';
      case 'Intermediate':
        return 'bg-blue-900 text-blue-200';
      case 'Advanced':
        return 'bg-purple-900 text-purple-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Courses</h3>
      
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-800 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-white">{course.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Track: {getTrackTitle(course.track_id)}
                    </p>
                    <p className="text-gray-400">
                      {expandedCourse === course.id
                        ? course.description
                        : `${course.description.slice(0, 100)}${course.description.length > 100 ? '...' : ''}`}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Duration: {course.duration_hours} hours
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleExpand(course.id)}
                      className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {expandedCourse === course.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No courses found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first course!</p>
        </div>
      )}
    </div>
  );
};

export default CourseListAdmin;