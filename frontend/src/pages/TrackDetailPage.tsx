import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseList from '../components/Courses/CourseList';
import { LearningTrack, Course } from '../../../shared/src/types'; // Import types

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

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Tracks
      </Link>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">
        Courses in {track ? track.title : 'this Track'}
      </h2>
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
