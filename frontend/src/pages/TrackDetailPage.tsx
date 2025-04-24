import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseList from '../components/Courses/CourseList';
import { LearningTrack, Course } from '../../../shared/src/types'; // Import types
import { Award, BarChart2, BookOpen, ChevronLeft, Clock } from 'lucide-react';

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

  if (isLoading && courses.length === 0) return <p>Loading track details...</p>;
  if (error) return <p className="text-red-500">Error loading track: {error}</p>;
  // Calculate track statistics
  const totalHours = courses.reduce((acc, course) => acc + course.duration_hours, 0);
  const completedCourses = courses.filter(course => course.progress?.status === 'Completed').length;
  const inProgressCourses = courses.filter(course => course.progress?.status === 'In Progress').length;
  const overallProgress = courses.length > 0
    ? Math.round((courses.reduce((acc, course) => acc + (course.progress?.progress_percentage || 0), 0) / courses.length))
    : 0;

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <Link 
          to="/courses" 
          className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Tracks
        </Link>
      </div>


      <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mt-4">
        Courses in {track ? track.title : 'this Track'}
      </h2>
      <p className="text-muted-foreground">{track?.description}</p>

      <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
        </div>

      {courses.length > 0 ? (
        <CourseList 
          courses={courses} 
          isLoading={isLoading && courses.length > 0} 
          onEnroll={handleStartCourse}
          onReset={handleResetCourse} 
          onUpdateProgress={(courseId, progress) => {
            // TypeScript type coercion to match the expected function signature
            return updateProgress(courseId, progress) as unknown as Promise<void>;
          }} 
        />
      ) : (
        !isLoading && <p>No courses found for this track.</p>
      )}
    </div>
  );
};

export default TrackDetailPage;
