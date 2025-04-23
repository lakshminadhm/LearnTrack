import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useCourses } from '../hooks/useCourses';
import { Course } from '../../../shared/src/types';
import { ChevronLeft, BookOpen, Clock, Award, BarChart2, CheckCircle, Share2, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import ConceptTree from '../components/Courses/ConceptTree';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Animation hooks
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    if (courseId) {
      // Fetch the specific course details
      getCourseById(courseId).then(fetchedCourse => {
        if (fetchedCourse) {
          setCourse(fetchedCourse);
        } else {
          setCourse(null);
        }
      });

      // Check if course is bookmarked
      const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(courseId));
    }
  }, [courseId, getCourseById]);

  // Handle progress updates from the concept tree
  const handleProgressUpdate = (progress: number) => {
    setConceptProgress(progress);
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('courseBookmarks') || '[]');
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter((id: string) => id !== courseId);
      localStorage.setItem('courseBookmarks', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
      toast.success('Course removed from bookmarks');
    } else {
      bookmarks.push(courseId);
      localStorage.setItem('courseBookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast.success('Course bookmarked successfully');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'Course',
          text: course?.description || '',
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Course link copied to clipboard');
    }
  };

  const handleDownloadCertificate = () => {
    if (progressPercentage === 100) {
      toast.success('Certificate download started');
      // Certificate download logic would go here
    }
  };

  if (isLoading && !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-800">Error loading course: {error}</p>
        <Link to="/courses" className="mt-4 btn btn-secondary inline-flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Course not found</h3>
        <p className="text-muted-foreground mb-6">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/courses" className="btn btn-primary inline-flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Link>
      </div>
    );
  }

  // Use concept progress if available, otherwise fall back to course.progress
  const progressPercentage = conceptProgress !== null 
    ? conceptProgress 
    : (course.progress?.progress_percentage || 0);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between">
        <Link 
          to={`/tracks/${course.track_id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Track
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Info Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBookmark}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title="Share course"
                  >
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">{course.description}</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center text-sm">
                  <Award className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{course.difficulty}</span>
                </div>
                <div className="flex items-center text-sm">
                  <BarChart2 className="w-4 h-4 text-muted-foreground mr-2" />
                  <span>{progressPercentage}% Complete</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {progressPercentage === 100 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Course Completed!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Congratulations on finishing this course!
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDownloadCertificate}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="lg:col-span-9">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;