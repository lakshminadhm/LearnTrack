import { useState, useEffect, useCallback } from 'react';
import { Streak, Progress, TechBreakdown } from '../../../shared/src/types';
import { analyticsApi } from '../services/api';
import toast from 'react-hot-toast';

export const useAnalytics = () => {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [techBreakdown, setTechBreakdown] = useState<TechBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreaks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsApi.getStreaks();
      
      if (response.success && response.data) {
        setStreak(response.data);
      } else {
        setError(response.error || 'Failed to fetch streaks');
        toast.error(response.error || 'Failed to fetch streaks');
      }
    } catch (err) {
      setError('An error occurred while fetching streaks');
      toast.error('An error occurred while fetching streaks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsApi.getProgress();
      
      if (response.success && response.data) {
        setProgress(response.data);
      } else {
        setError(response.error || 'Failed to fetch progress');
        toast.error(response.error || 'Failed to fetch progress');
      }
    } catch (err) {
      setError('An error occurred while fetching progress');
      toast.error('An error occurred while fetching progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTechBreakdown = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await analyticsApi.getTechBreakdown();
      
      if (response.success && response.data) {
        setTechBreakdown(response.data);
      } else {
        setError(response.error || 'Failed to fetch tech breakdown');
        toast.error(response.error || 'Failed to fetch tech breakdown');
      }
    } catch (err) {
      setError('An error occurred while fetching tech breakdown');
      toast.error('An error occurred while fetching tech breakdown');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStreaks(),
        fetchProgress(),
        fetchTechBreakdown()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStreaks, fetchProgress, fetchTechBreakdown]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  return {
    streak,
    progress,
    techBreakdown,
    isLoading,
    error,
    fetchStreaks,
    fetchProgress,
    fetchTechBreakdown,
    fetchAllAnalytics
  };
};