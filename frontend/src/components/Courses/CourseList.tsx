import React from 'react';
import { Course } from '../../../../shared/src/types';
import { BookOpen } from 'lucide-react';
import CourseItem from './CourseItem';

interface CourseListProps {
  courses: Course[];
  onEnroll: (courseId: string) => Promise<void>;
  onUpdateProgress: (courseId: string, progress: number) => Promise<void>;
  onReset?: (courseId: string) => Promise<void>;
  isLoading: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEnroll,
  onReset,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No courses available</p>
        <p className="text-sm text-gray-400 mt-1">Select a learning track to view its courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseItem 
          key={course.id} 
          course={course} 
          onStartCourse={onEnroll}
          onResetCourse={onReset}
        />
      ))}
    </div>
  );
};

export default React.memo(CourseList);
