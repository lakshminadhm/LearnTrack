import React from 'react';
import TrackList from '../components/Courses/TrackList';
import { useCourses } from '../hooks/useCourses';
import { useNavigate } from 'react-router-dom';

const CoursesPage: React.FC = () => {
  const {
    tracks,
    isLoading,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    goToPage,
  } = useCourses();
  const navigate = useNavigate();

  const [selectedTrack, setSelectedTrack] = React.useState<string | null>(null);

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrack(trackId);
    navigate(`/tracks/${trackId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Learning Tracks</h1>
        <p className="text-gray-600 mt-1">
          Explore our curated learning tracks and click on one to see its courses.
        </p>
      </div>

      <div>
        <TrackList
          tracks={tracks}
          onSelectTrack={handleSelectTrack}
          isLoading={isLoading}
          searchTerm={searchTerm}
          selectedTrack={selectedTrack}
          onSearch={setSearchTerm}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
};

export default CoursesPage;