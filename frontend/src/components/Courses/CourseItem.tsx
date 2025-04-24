import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseDifficulty, CourseStatus } from '../../../../shared/src/types';
import { Clock, Award, MoreVertical, RotateCcw, Play, ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface CourseItemProps {
  course: Course;
  onStartCourse: (courseId: string) => void;
  onResetCourse?: (courseId: string) => void;
  onUpdateProgress?: (courseId: string, progress: number) => void;
  viewMode?: 'grid' | 'list';
}

const CourseItem: React.FC<CourseItemProps> = ({ 
  course, 
  onStartCourse, 
  onResetCourse,
  onUpdateProgress,
  viewMode = 'grid'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const getDifficultyVariant = (difficulty: CourseDifficulty): string => {
    switch (difficulty) {
      case CourseDifficulty.BEGINNER:
        return 'success';
      case CourseDifficulty.INTERMEDIATE:
        return 'info';
      case CourseDifficulty.ADVANCED:
        return 'accent';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status: CourseStatus): string => {
    switch (status) {
      case CourseStatus.NOT_STARTED:
        return 'default';
      case CourseStatus.IN_PROGRESS:
        return 'warning';
      case CourseStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-dropdown]')) {
          setShowDropdown(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Render grid view
  if (viewMode === 'grid') {
    return (
      <Card
        variant="bordered"
        hoverEffect
        className="transition-all duration-normal"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <Badge size='sm' variant={getDifficultyVariant(course.difficulty as CourseDifficulty)}>
                {course.difficulty}
              </Badge>
              {course.progress && (
                <Badge size='sm' variant={getStatusVariant(course.progress.status as CourseStatus)}>
                  {course.progress.status}
                </Badge>
              )}
            </div>
            <div className="relative" data-dropdown>
              <button
                onClick={toggleDropdown}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-elevation-medium dark:shadow-elevation-medium-dark border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={handleResetClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Course
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <Link to={`/courses/${course.id}`} className="block">
            <h3 className={cn(
              "text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors line-clamp-2",
              isHovering && "text-primary-600 dark:text-primary-400"
            )}>
              {course.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          </Link>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Clock className="w-4 h-4 mr-1.5" />
            {course.duration_hours} hours
          </div>
          
          {course.progress && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Progress: {course.progress.progress_percentage}%
                </span>
                {course.progress.progress_percentage === 100 && (
                  <span className="text-base">🎉</span>
                )}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    course.progress.progress_percentage === 100 
                      ? "bg-green-500 dark:bg-green-600" 
                      : "bg-primary-500 dark:bg-primary-600"
                  )}
                  style={{ width: `${course.progress.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          {course.progress ? (
            <Button
              as={Link}
              to={`/courses/${course.id}`}
              variant="primary"
              fullWidth
              leftIcon={<ExternalLink size={16} />}
            >
              {course.progress.progress_percentage > 0 ? 'Continue Course' : 'View Course'}
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Play size={16} />}
              onClick={handleStartClick}
            >
              Start Course
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Render list view
  return (
    <Card
      variant="bordered"
      hoverEffect
      className="transition-all duration-normal"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={getDifficultyVariant(course.difficulty as CourseDifficulty)}>
                {course.difficulty}
              </Badge>
              {course.progress && (
                <Badge variant={getStatusVariant(course.progress.status as CourseStatus)}>
                  {course.progress.status}
                </Badge>
              )}
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {course.duration_hours} hours
              </div>
            </div>
            
            <Link to={`/courses/${course.id}`} className="block">
              <h3 className={cn(
                "text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors",
                isHovering && "text-primary-600 dark:text-primary-400"
              )}>
                {course.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {course.description}
              </p>
            </Link>
            
            {course.progress && (
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Progress: {course.progress.progress_percentage}%
                  </span>
                  {course.progress.progress_percentage === 100 && (
                    <span className="text-base">🎉</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      course.progress.progress_percentage === 100 
                        ? "bg-green-500 dark:bg-green-600" 
                        : "bg-primary-500 dark:bg-primary-600"
                    )}
                    style={{ width: `${course.progress.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex md:flex-col gap-3 items-start md:justify-center md:items-end relative">
            {course.progress ? (
              <Button
                as={Link}
                to={`/courses/${course.id}`}
                variant="primary"
                size="sm"
                className="flex-1 md:flex-none md:w-full"
              >
                {course.progress.progress_percentage > 0 ? 'Continue' : 'View'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="flex-1 md:flex-none md:w-full"
                onClick={handleStartClick}
              >
                Start Course
              </Button>
            )}
            
            <div className="relative" data-dropdown>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDropdown}
                className="flex-shrink-0 md:w-full"
              >
                Options
              </Button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-elevation-medium dark:shadow-elevation-medium-dark border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={handleResetClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(CourseItem);