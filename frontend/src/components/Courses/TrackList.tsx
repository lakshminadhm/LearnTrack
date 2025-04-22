import React from 'react';
import { useCollapse } from 'react-collapsed';
import { LearningTrack } from '../../../../shared/src/types';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface TrackListProps {
  tracks: LearningTrack[];
  selectedTrack: string | null;
  onSelectTrack: (trackId: string) => void;
  isLoading: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// New child component for each track
const TrackListItem: React.FC<{
  track: LearningTrack;
  isSelected: boolean;
  onSelect: (trackId: string) => void;
}> = ({ track, isSelected, onSelect }) => {
  const { getToggleProps } = useCollapse({ isExpanded: isSelected });
  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden transition-shadow duration-300 ${
        isSelected ? 'ring-2 ring-indigo-500' : ''
      }`}
    >
      <div
        className="p-6 cursor-pointer"
        {...getToggleProps({
          onClick: () => onSelect(track.id)
        })}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-semibold text-white">{track.title}</h3>
          </div>
          {isSelected ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <p className="mt-2 text-gray-400">{track.description}</p>
      </div>
    </div>
  );
};

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  selectedTrack,
  onSelectTrack,
  isLoading,
  searchTerm,
  onSearch,
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search learning tracks..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {tracks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <TrackListItem
              key={track.id}
              track={track}
              isSelected={selectedTrack === track.id}
              onSelect={onSelectTrack}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No learning tracks found</p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackList;