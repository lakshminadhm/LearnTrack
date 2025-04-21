import { useState, useEffect, useCallback } from 'react';
import { LearningTrack, Course, UserCourseProgress, PaginationParams } from '../../../shared/src/types';
import { coursesApi } from '../services/api';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

interface UseCoursesOptions {
  limit?: number;
  initialPage?: number;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const { limit = 10, initialPage = 1 } = options;
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [totalTracks, setTotalTracks] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserCourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchTracks = useCallback(async (page: number, search?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: PaginationParams = {
        limit,
        offset: (page - 1) * limit,
        search
      };
      
      const response = await coursesApi.getTracks(params);
      
      if (response.success && response.data) {
        const { data, total } = response.data;
        setTracks(data);
        setTotalTracks(total);
      } else {
        setError(response.error || 'Failed to fetch tracks');
        toast.error(response.error || 'Failed to fetch tracks');
      }
    } catch (err) {
      setError('An error occurred while fetching tracks');
      toast.error('An error occurred while fetching tracks');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const getCoursesForTrack = useCallback(async (trackId: string): Promise<Course[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await coursesApi.getCourses(trackId);
      
      if (response.success && response.data) {
        setCourses(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch courses');
        toast.error(response.error || 'Failed to fetch courses');
        setCourses([]);
        return null;
      }
    } catch (err) {
      setError('An error occurred while fetching courses');
      toast.error('An error occurred while fetching courses');
      setCourses([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourseById = useCallback(async (courseId: string): Promise<Course | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await coursesApi.getCourseById(courseId);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch course details');
        toast.error(response.error || 'Failed to fetch course details');
        return null;
      }
    } catch (err) {
      setError('An error occurred while fetching course details');
      toast.error('An error occurred while fetching course details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleConceptCompletion = useCallback(async (courseId: string, conceptId: string, isCompleted: boolean): Promise<boolean> => {
    try {
      const response = await coursesApi.toggleConcept(courseId, conceptId, isCompleted);
      if (response.success) {
        toast.success(`Concept ${isCompleted ? 'marked as complete' : 'marked as incomplete'}`);
        return true;
      } else {
        toast.error(response.error || 'Failed to update concept status');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while updating concept status');
      return false;
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await coursesApi.getProgress();
      
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

  const startCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await coursesApi.startCourse(courseId); 
      if (response.success && response.data) {
        await fetchProgress();
        const currentTrackId = courses[0]?.track_id;
        if (currentTrackId) {
          await getCoursesForTrack(currentTrackId);
        }
        toast.success('Successfully started course');
      } else {
        toast.error(response.error || 'Failed to start course');
      }
    } catch (err) {
      toast.error('An error occurred while starting course');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProgress, getCoursesForTrack, courses]);

  const updateProgress = useCallback(async (courseId: string, progressPercentage: number) => {
    setIsLoading(true);
    
    try {
      const response = await coursesApi.updateProgress(courseId, progressPercentage);
      
      if (response.success && response.data) {
        await fetchProgress();
        toast.success('Progress updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update progress');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while updating progress');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProgress]);

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setCurrentPage(1);
      fetchTracks(1, search);
    }, 300),
    [fetchTracks]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchTracks(currentPage);
    }
    return () => debouncedSearch.cancel();
  }, [currentPage, searchTerm, debouncedSearch, fetchTracks]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const totalPages = Math.ceil(totalTracks / limit);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    tracks,
    courses,
    progress,
    isLoading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    goToPage,
    startCourse,
    updateProgress,
    getCoursesForTrack,
    getCourseById,
    toggleConceptCompletion,
    // getTrackById,
  };
};