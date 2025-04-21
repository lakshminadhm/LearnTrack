import React, { useState } from 'react';
import { LearningTrack, AdminTrackUpdate } from '../../../../shared/src/types';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface TrackListAdminProps {
  tracks: LearningTrack[];
  onEdit: (data: AdminTrackUpdate) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const TrackListAdmin: React.FC<TrackListAdminProps> = ({
  tracks,
  onEdit,
  onDelete,
  isLoading
}) => {
  const [editingTrack, setEditingTrack] = useState<LearningTrack | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const handleEdit = async (track: LearningTrack) => {
    setEditingTrack(track);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this track? This will also delete all associated courses.')) {
      await onDelete(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTrack(expandedTrack === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Learning Tracks</h3>
      
      {tracks.length > 0 ? (
        <div className="space-y-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-gray-800 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-white">{track.title}</h4>
                    <p className="text-gray-400 mt-1">
                      {expandedTrack === track.id
                        ? track.description
                        : `${track.description.slice(0, 100)}${track.description.length > 100 ? '...' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(track)}
                      className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(track.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleExpand(track.id)}
                      className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {expandedTrack === track.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No tracks found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first learning track!</p>
        </div>
      )}
    </div>
  );
};

export default TrackListAdmin;