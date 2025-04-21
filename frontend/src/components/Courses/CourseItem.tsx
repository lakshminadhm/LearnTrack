import React from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseDifficulty, CourseStatus } from '../../../../shared/src/types';
import { Clock, Award } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  onStartCourse: (courseId: string) => void;
}

const CourseItem: React.FC<CourseItemProps> = ({ course, onStartCourse }) => {
  const getDifficultyColor = (difficulty: CourseDifficulty) => {
    switch (difficulty) {
      case CourseDifficulty.BEGINNER:
        return 'bg-green-100 text-green-800';
      case CourseDifficulty.INTERMEDIATE:
        return 'bg-blue-100 text-blue-800';
      case CourseDifficulty.ADVANCED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
      case CourseStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case CourseStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onStartCourse(course.id);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
          <p className="text-gray-600 mt-1">{course.description}</p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{course.duration_hours} hours</span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                course.difficulty
              )}`}
            >
              <Award className="w-3 h-3 mr-1" />
              {course.difficulty}
            </span>
            {course.progress && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  course.progress.status
                )}`}
              >
                {course.progress.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {course.progress ? (
        <div className="mt-6 flex items-center space-x-4">
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Course
          </Link>
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600"
              style={{ width: `${course.progress.progress_percentage}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartClick}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Course
        </button>
      )}
    </div>
  );
};

export default CourseItem;