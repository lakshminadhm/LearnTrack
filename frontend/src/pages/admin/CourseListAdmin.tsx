import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { Plus, Edit, Trash, ChevronRight } from 'lucide-react';

const CourseListAdmin: React.FC = () => {
  const { tracks, courses, getCoursesForTrack, isLoading, error } = useCourses();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTrackId) {
      getCoursesForTrack(selectedTrackId);
    }
  }, [selectedTrackId, getCoursesForTrack]);

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
  };

  if (isLoading) return <div className="text-center py-10">Loading courses...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <Link 
          to={selectedTrackId ? `/admin/courses/new?trackId=${selectedTrackId}` : "/admin/courses/new"}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700"
        >
          <Plus size={18} className="mr-1" />
          Add Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Learning Tracks</h2>
          
          {tracks.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No tracks found</div>
          ) : (
            <ul className="space-y-2">
              {tracks.map(track => (
                <li 
                  key={track.id}
                  className={`cursor-pointer p-3 rounded-md flex justify-between items-center ${
                    selectedTrackId === track.id ? 'bg-indigo-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleTrackSelect(track.id)}
                >
                  <span className="font-medium">{track.title}</span>
                  <ChevronRight size={16} />
                </li>
              ))}
            </ul>
          )}
          
          <div className="mt-4 text-center">
            <Link 
              to="/admin/tracks" 
              className="text-indigo-600 text-sm hover:underline"
            >
              Manage Tracks
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            {selectedTrackId ? `Courses for ${tracks.find(t => t.id === selectedTrackId)?.title}` : 'Select a track'}
          </h2>

          {!selectedTrackId ? (
            <div className="text-gray-500 text-center py-12">Select a track to view its courses</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-500 text-center py-12">No courses found for this track</div>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className="border rounded-md p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span>{course.duration_hours} hours</span>
                        <span>{course.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/admin/courses/edit/${course.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit course"
                      >
                        <Edit size={18} />
                      </Link>
                      <Link 
                        to={`/courses/${course.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded"
                        title="View course"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseListAdmin;