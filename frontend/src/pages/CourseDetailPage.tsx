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
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <Link 
        to={`/tracks/${course.track_id}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Course List
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
      <p className="text-gray-600 mt-1">{course.description}</p>
      
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">Course Content</h2>

        {/* Course progress indicator */}
        {course.progress && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{course.progress.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${course.progress.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Hierarchical concept tree */}
        <div className="mt-6">
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
  );
};

export default CourseDetailPage;
