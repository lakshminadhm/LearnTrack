import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseDifficulty, CourseStatus } from '../../../../shared/src/types';
import { Clock, Award, MoreVertical, RotateCcw } from 'lucide-react';

interface CourseItemProps {
  course: Course;
  onStartCourse: (courseId: string) => void;
  onResetCourse?: (courseId: string) => void;
}

const CourseItem: React.FC<CourseItemProps> = ({ course, onStartCourse, onResetCourse }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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
    console.log('Starting course:', course.id);
    onStartCourse(course.id);
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onResetCourse) {
      onResetCourse(course.id);
    }
    setShowDropdown(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(!showDropdown);
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
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                onClick={handleResetClick}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4 inline-block mr-2" />
                Reset Course
              </button>
            </div>
          )}
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

          <div className="flex flex-col space-y-1 w-full max-w-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {course.progress.progress_percentage}%
              </span>
              {course.progress.progress_percentage === 100 && (
                <span className="text-xl">🎉</span>
              )}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress.progress_percentage}%` }}
              ></div>
            </div>
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