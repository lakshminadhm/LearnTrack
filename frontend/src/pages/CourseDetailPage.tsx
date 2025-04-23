import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { Course } from '../../../shared/src/types';
import ConceptTree from '../components/Courses/ConceptTree';

const ONBOARDING_KEY = 'learntrack_onboarding_dismissed';

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
  const [conceptProgress, setConceptProgress] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  });

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

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  // Handle progress updates from the concept tree
  const handleProgressUpdate = (progress: number) => {
    setConceptProgress(progress);
  };

  if (isLoading && !course) return <p>Loading course details...</p>;
  if (error) return <p className="text-red-500">Error loading course: {error}</p>;
  if (!course) return <p>Course not found.</p>;

  // Calculate the circular progress stroke dash array and offset
  const calculateStrokeDashOffset = (percentage: number) => {
    const circumference = 2 * Math.PI * 45; // Circle radius is 45
    return circumference - (percentage / 100) * circumference;
  };

  // Use concept progress if available, otherwise fall back to course.progress
  const progressPercentage = conceptProgress !== null 
    ? conceptProgress 
    : (course.progress?.progress_percentage || 0);

  return (
    <div className="w-full px-2 md:px-6 mx-auto my-4 md:my-10 max-w-screen-2xl">
      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="mb-6 animate-fade-in rounded-2xl shadow-xl bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-400 text-white px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome to Your Learning Path!</h2>
            <ul className="list-disc ml-6 text-base space-y-1">
              <li>Track your course progress visually and interactively.</li>
              <li>Expand concepts to explore subtopics and mark them as complete.</li>
              <li>Admins can add new concepts using the <span className="font-semibold">“+”</span> button.</li>
              <li>Download or share your progress with your team.</li>
            </ul>
          </div>
          <button
            onClick={handleDismissOnboarding}
            className="absolute top-3 right-3 md:static md:ml-8 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Dismiss onboarding"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Header */}
      <div className="relative rounded-3xl shadow-2xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-700 via-indigo-500 to-blue-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-8 md:py-12 gap-4">
          <Link 
            to={`/tracks/${course.track_id}`}
            className="text-white/90 hover:text-white font-semibold flex items-center text-base md:text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Back to Course List"
          >
            <span className="mr-2 text-2xl">&larr;</span> Back to Course List
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-xl text-center md:text-left flex-1">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col-reverse lg:flex-row gap-8">
        {/* Sidebar: Course Info & Progress */}
        <aside className="lg:w-1/3 xl:w-1/4 flex-shrink-0 w-full lg:sticky lg:top-8 z-20">
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">About this Course</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base mb-6">{course.description}</p>
            <div className="border-t border-gray-200 dark:border-gray-800 my-6" />
            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">Progress</h2>
            {course.progress || conceptProgress !== null ? (
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-6 border border-indigo-100/80 dark:border-indigo-800 shadow-md transition-all mb-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion</span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{progressPercentage}%</span>
                </div>
                {/* Circular Progress Indicator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-indigo-100 dark:text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                      <circle className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-in-out" strokeWidth="8" strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={calculateStrokeDashOffset(progressPercentage)} transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-indigo-100 dark:bg-gray-800 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-400 dark:from-indigo-600 dark:to-blue-500 h-full rounded-full transition-all duration-500 flex items-center justify-end" style={{ width: `${progressPercentage}%` }}>
                    {progressPercentage > 5 && (
                      <div className="h-5 w-5 bg-white dark:bg-gray-900 rounded-full shadow-sm mr-0.5 hidden sm:flex items-center justify-center">
                        <div className="h-2.5 w-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-6 border border-gray-100 dark:border-gray-800 text-center">
                <span className="text-gray-400 dark:text-gray-500">No progress data available</span>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                title="Download Progress as CSV"
                aria-label="Download Progress"
                onClick={() => {
                  // Placeholder: implement CSV export logic
                  alert('Download as CSV coming soon!');
                }}
              >
                Download Progress
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                title="Share Course"
                aria-label="Share Course"
                onClick={() => {
                  // Placeholder: implement share modal logic
                  alert('Share course link coming soon!');
                }}
              >
                Share Course
              </button>
            </div>
          </div>
        </aside>

        {/* Main: Concepts Tree */}
        <main className="flex-1 min-w-0 relative">
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-8 animate-fade-in-up">
            {courseId && (
              <ConceptTree
                courseId={courseId}
                fetchConceptTree={fetchConceptTree}
                fetchConceptChildren={fetchConceptChildren}
                completeConcept={completeConcept}
                createConcept={createConcept}
                onProgressUpdate={handleProgressUpdate}
              />
            )}
          </div>
          {/* Floating Action Button for Admins (Concept Add) */}
          {/* This will be rendered by ConceptTree if user is admin, but you can move it here if you want a global FAB */}
        </main>
      </div>
    </div>
  );
};

export default CourseDetailPage;
