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
    enrollCourse, 
    updateProgress, 
    toggleConceptCompletion 
  } = useCourses(); 
  const [track, setTrack] = useState<LearningTrack | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (trackId) {
      getCoursesForTrack(trackId).then(fetchedCourses => {
        if (fetchedCourses) {
          setCourses(fetchedCourses);
        }
      });
    }
  }, [trackId, getCoursesForTrack, getTrackById]);

  const handleToggleConcept = async (courseId: string, conceptId: string, isCompleted: boolean) => {
    console.log(`Toggling concept ${conceptId} in course ${courseId} to ${isCompleted}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
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
          onEnroll={enrollCourse} 
          onUpdateProgress={updateProgress} 
          onToggleConcept={handleToggleConcept} 
        />
      ) : (
        !isLoading && <p>No courses found for this track.</p>
      )}
    </div>
  );
};

export default TrackDetailPage;
