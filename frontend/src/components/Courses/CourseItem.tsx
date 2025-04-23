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
    <div className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all group hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">{course.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base mb-2">{course.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              {course.duration_hours} hours
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)} dark:bg-opacity-80`}>
              <Award className="w-3 h-3 mr-1" />
              {course.difficulty}
            </span>
            {course.progress && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.progress.status)} dark:bg-opacity-80`}>
                {course.progress.status}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-800 focus:outline-none transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl dark:bg-gray-900 dark:border-gray-800 z-10">
              <button
                onClick={handleResetClick}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4 inline-block mr-2" />
                Reset Course
              </button>
            </div>
          )}
        </div>
      </div>
      {course.progress ? (
        <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
          <Link
            to={`/courses/${course.id}`}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-base hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 shadow transition-colors"
          >
            View Course
          </Link>
          <div className="flex flex-col space-y-2 w-full max-w-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Progress: {course.progress.progress_percentage}%
              </span>
              {course.progress.progress_percentage === 100 && (
                <span className="text-xl">🎉</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-800">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300 dark:bg-indigo-700"
                style={{ width: `${course.progress.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartClick}
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
        >
          Start Course
        </button>
      )}
    </div>
  );
};

export default CourseItem;