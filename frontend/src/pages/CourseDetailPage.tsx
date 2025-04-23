import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { Course, CourseDifficulty } from '../../../shared/src/types';
import ConceptTree from '../components/Courses/ConceptTree';
import { Page, PageHeader, PageContent, PageSection } from '../components/ui/Page';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Clock, Download, Share2, ArrowLeft, Book, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

const ONBOARDING_KEY = 'learntrack_onboarding_dismissed';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
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
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  // Handle back navigation
  const handleBackNavigation = () => {
    if (course?.track_id) {
      navigate(`/tracks/${course.track_id}`);
    } else {
      navigate('/courses');
    }
  };

  // Get difficulty badge variant
  const getDifficultyVariant = (difficulty?: CourseDifficulty): string => {
    if (!difficulty) return 'default';
    
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

  // Calculate the circular progress stroke dash array and offset
  const calculateStrokeDashOffset = (percentage: number) => {
    const circumference = 2 * Math.PI * 45; // Circle radius is 45
    return circumference - (percentage / 100) * circumference;
  };

  // Use concept progress if available, otherwise fall back to course.progress
  const progressPercentage = conceptProgress !== null 
    ? conceptProgress 
    : (course?.progress?.progress_percentage || 0);
  
  // Loading state
  if (isLoading && !course) {
    return (
      <Page className="container max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </Page>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Page className="container max-w-screen-xl mx-auto">
        <Card variant="bordered">
          <CardContent className="p-8 flex flex-col items-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">Error Loading Course</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button variant="outline" as={Link} to="/courses" leftIcon={<ArrowLeft size={16} />}>
              Return to Courses
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }
  
  // Not found state
  if (!course) {
    return (
      <Page className="container max-w-screen-xl mx-auto">
        <Card variant="bordered">
          <CardContent className="p-8 flex flex-col items-center">
            <Book size={48} className="text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Course Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" as={Link} to="/courses" leftIcon={<ArrowLeft size={16} />}>
              Browse All Courses
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page className="container max-w-screen-xl mx-auto" animation="fade-in">
      {/* Onboarding Banner */}
      {showOnboarding && (
        <Card className="mb-8 bg-gradient-to-r from-primary-600 to-primary-400 text-white border-none shadow-elevation-large overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Welcome to Your Learning Path!</h2>
                <ul className="list-disc ml-6 text-base space-y-1">
                  <li>Track your progress visually through the concept tree.</li>
                  <li>Expand concepts to explore subtopics and mark them as complete.</li>
                  <li>Admins can add new concepts using the "+" button.</li>
                  <li>Download or share your progress with your team.</li>
                </ul>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={handleDismissOnboarding}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Header */}
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            {course.title}
            {course.difficulty && (
              <Badge variant={getDifficultyVariant(course.difficulty as CourseDifficulty)}>
                {course.difficulty}
              </Badge>
            )}
          </div>
        }
        description={
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{course.duration_hours} hours</span>
          </div>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to={course.track_id ? `/tracks/${course.track_id}` : '/courses'}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to {course.track_id ? 'Track' : 'Courses'}
          </Button>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
          {/* Sidebar: Course Info & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info Card */}
            <Card variant="bordered" className="shadow-elevation-medium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">About this Course</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{course.description}</p>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-5 h-5 mr-2 text-primary-500" />
                  <span>Level: <span className="font-medium">{course.difficulty || 'Not specified'}</span></span>
                </div>
                
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 mr-2 text-primary-500" />
                  <span>Duration: <span className="font-medium">{course.duration_hours} hours</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card variant="bordered" className="shadow-elevation-medium">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Progress</h2>
                
                {/* Circular Progress */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-100 dark:text-gray-800" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className={cn(
                          "transition-all duration-1000 ease-out",
                          progressPercentage >= 100 
                            ? "text-green-500 dark:text-green-400" 
                            : "text-primary-500 dark:text-primary-400"
                        )}
                        strokeWidth="10" 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50" 
                        strokeDasharray={2 * Math.PI * 45} 
                        strokeDashoffset={calculateStrokeDashOffset(progressPercentage)} 
                        transform="rotate(-90 50 50)" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Complete</span>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                {progressPercentage > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {course.progress?.completed_concepts || 0} concepts completed
                      </span>
                    </div>
                    
                    {course.progress?.last_activity && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last activity: {new Date(course.progress.last_activity).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    leftIcon={<Download size={16} />}
                    onClick={() => {
                      // Placeholder: implement CSV export logic
                      alert('Download progress as CSV coming soon!');
                    }}
                  >
                    Export Progress
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Share2 size={16} />}
                    onClick={() => setShareModalOpen(true)}
                  >
                    Share Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content: Concept Tree */}
          <div className="lg:col-span-6">
            <Card variant="bordered" className="shadow-elevation-medium overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Content</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Explore the course structure and track your learning progress
                  </p>
                </div>
                <div className="p-6">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
      
      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share this Course"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Share this course with your colleagues or friends:
          </p>
          
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <input 
              type="text"
              readOnly
              value={window.location.href}
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-300"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
            >
              Copy
            </Button>
          </div>
          
          <div className="flex gap-3 mt-6 justify-end">
            <Button
              variant="outline"
              onClick={() => setShareModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default CourseDetailPage;
