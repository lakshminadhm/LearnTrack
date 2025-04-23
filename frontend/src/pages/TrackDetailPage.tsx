import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useCourses } from '../hooks/useCourses';
import { LearningTrack, Course } from '../../../shared/src/types';
import { ChevronLeft, BookOpen, Clock, Award, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const TrackDetailPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { 
    getTrackById, 
    getCoursesForTrack, 
    isLoading, 
    error,
    startCourse,
    updateProgress,
    resetCourse
  } = useCourses();
  const [track, setTrack] = useState<LearningTrack | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const fetchCourses = async () => {
    if (trackId) {
      const fetchedCourses = await getCoursesForTrack(trackId);
      if (fetchedCourses) {
        setCourses(fetchedCourses);
      }
    }
  };

  useEffect(() => {
    if (trackId) {
      // Load track details
      getTrackById?.(trackId).then(fetchedTrack => {
        if (fetchedTrack) {
          setTrack(fetchedTrack);
        }
      });
      
      // Load courses for this track
      fetchCourses();
    }
  }, [trackId, getCoursesForTrack, getTrackById]);

  const handleStartCourse = async (courseId: string) => {
    await startCourse(courseId);
    // Refetch courses to update UI
    await fetchCourses();
  };

  const handleResetCourse = async (courseId: string) => {
    const success = await resetCourse(courseId);
    if (success) {
      // Refetch courses to update UI
      await fetchCourses();
    }
  };

  if (isLoading && !track) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading track details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-800">Error loading track: {error}</p>
        <Link to="/courses" className="mt-4 btn btn-secondary inline-flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Tracks
        </Link>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Track not found</h3>
        <p className="text-muted-foreground mb-6">
          The learning track you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/courses" className="btn btn-primary inline-flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Tracks
        </Link>
      </div>
    );
  }

  // Calculate track statistics
  const totalHours = courses.reduce((acc, course) => acc + course.duration_hours, 0);
  const completedCourses = courses.filter(course => course.progress?.status === 'Completed').length;
  const inProgressCourses = courses.filter(course => course.progress?.status === 'In Progress').length;
  const overallProgress = courses.length > 0
    ? Math.round((courses.reduce((acc, course) => acc + (course.progress?.progress_percentage || 0), 0) / courses.length))
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          to="/courses" 
          className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Tracks
        </Link>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-6 border-b bg-muted/30">
          <h1 className="text-2xl font-bold text-foreground mb-2">{track.title}</h1>
          <p className="text-muted-foreground">{track.description}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
              <Clock className="w-5 h-5 text-primary-600 mb-2" />
              <div className="text-2xl font-bold text-primary-700">{totalHours}</div>
              <div className="text-sm text-primary-600">Total Hours</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <Award className="w-5 h-5 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700">{completedCourses}</div>
              <div className="text-sm text-green-600">Completed Courses</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <BookOpen className="w-5 h-5 text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{inProgressCourses}</div>
              <div className="text-sm text-yellow-600">In Progress</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <BarChart2 className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{overallProgress}%</div>
              <div className="text-sm text-blue-600">Overall Progress</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-6">Course List</h2>

          {courses.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses available for this track yet.</p>
            </div>
          ) : (
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="space-y-4"
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  className="bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <span className={`badge ${
                            course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {course.duration_hours} hours
                          </div>
                        </div>
                      </div>
                    </div>

                    {course.progress ? (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Progress: {course.progress.progress_percentage}%
                          </div>
                          <Link
                            to={`/courses/${course.id}`}
                            className="btn btn-primary"
                          >
                            Continue Learning
                          </Link>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${course.progress.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <button
                          onClick={() => handleStartCourse(course.id)}
                          className="btn btn-primary"
                        >
                          Start Course
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPage;