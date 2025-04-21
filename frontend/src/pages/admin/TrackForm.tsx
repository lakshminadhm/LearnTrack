import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LearningTrack, AdminTrackCreate } from '../../../../shared/src/types';
import { useAdmin } from '../../hooks/useAdmin';

const TrackForm: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { tracks, createTrack, updateTrack, getTrackById, isLoading, fetchTracks } = useAdmin();
  
  const [formData, setFormData] = useState<AdminTrackCreate>({
    title: '',
    description: ''
  });
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [formInitialized, setFormInitialized] = useState<boolean>(false);

  const isEditMode = !!trackId;

  // First, load tracks if needed (only once)
  useEffect(() => {
    const loadTracks = async () => {
      if (isEditMode && (!tracks || tracks.length === 0)) {
        await fetchTracks();
      }
      setInitialLoading(false);
    };

    loadTracks();
  }, [isEditMode, fetchTracks]); // Removed tracks from dependencies to avoid re-runs

  // Then populate form with track data once tracks are loaded (only once)
  useEffect(() => {
    // Skip if already initialized or still loading
    if (formInitialized || initialLoading) {
      return;
    }
    
    if (isEditMode && trackId) {
      const track = getTrackById(trackId);
      if (track) {
        console.log('Found track for editing:', track.title);
        setFormData({
          title: track.title,
          description: track.description
        });
      } else {
        console.log('Track not found with ID:', trackId);
        if (tracks && tracks.length > 0) {
          console.log('Available track IDs:', tracks.map(t => t.id));
          // Only navigate away if we have tracks but couldn't find the one we want
          navigate('/admin/tracks');
        }
      }
    }
    // Mark as initialized to prevent multiple attempts
    setFormInitialized(true);
  }, [trackId, getTrackById, isEditMode, navigate, tracks, initialLoading, formInitialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    
    if (isEditMode && trackId) {
      success = await updateTrack({
        id: trackId,
        ...formData
      });
    } else {
      success = await createTrack(formData);
    }
    
    if (success) {
      navigate('/admin/tracks');
    }
  };

  const handleCancel = () => {
    navigate('/admin/tracks');
  };
  
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading track data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Edit Learning Track' : 'Create New Learning Track'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Track Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Full Stack Development"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what students will learn in this track..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Track' : 'Create Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackForm;