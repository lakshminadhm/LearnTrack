import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { Course } from '../../../shared/src/types';
import ConceptTree from '../components/Courses/ConceptTree';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { 
    getCourseById,
    fetchConceptTree,
    fetchConceptChildren,
    completeConcept,
    createConcept,
    isLoading, 
    error 
  } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (courseId) {
      // Fetch the specific course details
      getCourseById(courseId).then(fetchedCourse => {
        if (fetchedCourse) {
          setCourse(fetchedCourse);
        } else {
          // Handle course not found
          setCourse(null); 
        }
      });
    }
  }, [courseId, getCourseById]);

  if (isLoading && !course) return <p>Loading course details...</p>;
  if (error) return <p className="text-red-500">Error loading course: {error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="w-full px-4 sm:px-6 mx-auto my-6 sm:my-10">
      <div className="backdrop-blur bg-white/80 border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-full">
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-indigo-500/80 to-blue-400/80 flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10">
          <Link 
            to={`/tracks/${course.track_id}`}
            className="text-white/90 hover:text-white font-medium flex items-center mb-3 sm:mb-0"
          >
            <span className="mr-2">&larr;</span> Back to Course List
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight drop-shadow">{course.title}</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-gray-200/50 px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-white/80 to-indigo-50/60">
          {/* Left: Course details and progress */}
          <div className="lg:col-span-3 lg:pr-6 xl:pr-8 mb-8 lg:mb-0">
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-3">About this Course</h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-3">Progress</h2>
                {course.progress ? (
                  <div className="bg-white/50 rounded-xl p-4 border border-indigo-100/80 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Completion</span>
                      <span className="text-sm font-bold text-indigo-700">{course.progress.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full rounded-full transition-all duration-500 flex items-center justify-end"
                        style={{ width: `${course.progress.progress_percentage}%` }}
                      >
                        {course.progress.progress_percentage > 5 && (
                          <div className="h-5 w-5 bg-white rounded-full shadow-sm mr-0.5 hidden sm:flex items-center justify-center">
                            <div className="h-2.5 w-2.5 bg-indigo-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 rounded-xl p-4 border border-gray-100 text-center">
                    <span className="text-gray-400">No progress data available</span>
                  </div>
                )}
              </div>
              
              {/* Additional course metadata could go here */}
            </div>
          </div>
          
          {/* Right: Concepts */}
          <div className="lg:col-span-9 lg:pl-6 xl:pl-8">
            {/* <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">Course Content</h2> */}
            {courseId && (
              <ConceptTree
                courseId={courseId}
                fetchConceptTree={fetchConceptTree}
                fetchConceptChildren={fetchConceptChildren}
                completeConcept={completeConcept}
                createConcept={createConcept}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
