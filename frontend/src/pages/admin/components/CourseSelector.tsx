import React from 'react';

interface CourseSelectorProps {
  tracks: any[];
  courses: any[];
  selectedTrackId: string;
  selectedCourseId: string;
  onTrackChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCourseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isLoadingTracks: boolean;
  isLoading: boolean;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  tracks,
  courses,
  selectedTrackId,
  selectedCourseId,
  onTrackChange,
  onCourseChange,
  isLoadingTracks,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Learning Track
        </label>
        <select
          value={selectedTrackId}
          onChange={onTrackChange}
          className="w-full px-4 py-2 border rounded-md"
          disabled={isLoadingTracks || isLoading}
        >
          <option value="">Select a track</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourseId}
          onChange={onCourseChange}
          className="w-full px-4 py-2 border rounded-md"
          disabled={!selectedTrackId || isLoading}
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};