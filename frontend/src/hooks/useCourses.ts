import { useState, useEffect, useCallback } from 'react';
import { LearningTrack, Course, UserCourseProgress, PaginationParams, Concept } from '../../../shared/src/types';
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
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [conceptTree, setConceptTree] = useState<Concept[]>([]);
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

  const fetchConceptsForCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await coursesApi.getCourseConcepts(courseId);
      
      if (response.success && response.data) {
        setConcepts(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch concepts');
        toast.error(response.error || 'Failed to fetch concepts');
        return [];
      }
    } catch (err) {
      setError('An error occurred while fetching concepts');
      toast.error('An error occurred while fetching concepts');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConceptChildren = useCallback(async (conceptId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await coursesApi.getConceptChildren(conceptId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch concept children');
        toast.error(response.error || 'Failed to fetch concept children');
        return [];
      }
    } catch (err) {
      setError('An error occurred while fetching concept children');
      toast.error('An error occurred while fetching concept children');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConceptTree = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await coursesApi.getConceptTree(courseId);
      
      if (response.success && response.data) {
        setConceptTree(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch concept tree');
        toast.error(response.error || 'Failed to fetch concept tree');
        setConceptTree([]);
        return [];
      }
    } catch (err) {
      setError('An error occurred while fetching concept tree');
      toast.error('An error occurred while fetching concept tree');
      setConceptTree([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeConcept = useCallback(async (conceptId: string) => {
    try {
      const response = await coursesApi.completeConcept(conceptId);
      
      if (response.success) {
        toast.success('Concept marked as completed');
        return true;
      } else {
        toast.error(response.error || 'Failed to complete concept');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while completing concept');
      return false;
    }
  }, []);

  const createConcept = useCallback(async (data: {
    courseId: string;
    name: string;
    description?: string;
    parentId?: string;
    resourceLinks?: string[];
  }) => {
    setIsLoading(true);
    
    try {
      const response = await coursesApi.createConcept(data);
      
      if (response.success && response.data) {
        toast.success('Concept created successfully');
        // Refresh concepts list if we're viewing the same course
        if (concepts.length > 0 && concepts[0].course_id === data.courseId) {
          await fetchConceptsForCourse(data.courseId);
        }
        // Refresh concept tree if we're viewing the same course
        if (conceptTree.length > 0 && conceptTree[0].course_id === data.courseId) {
          await fetchConceptTree(data.courseId);
        }
        return response.data;
      } else {
        toast.error(response.error || 'Failed to create concept');
        return null;
      }
    } catch (err) {
      toast.error('An error occurred while creating concept');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [concepts, conceptTree, fetchConceptsForCourse, fetchConceptTree]);

  const getTrackById = useCallback(async (trackId: string): Promise<LearningTrack | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await coursesApi.getTrackById(trackId);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch track details');
        toast.error(response.error || 'Failed to fetch track details');
        return null;
      }
    }
    catch (err) {
      setError('An error occurred while fetching track details');
      toast.error('An error occurred while fetching track details');
      return null;
    }
    finally {
      setIsLoading(false);
    }
  }, []);

  const resetCourse = useCallback(async (courseId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await coursesApi.resetCourse(courseId);
      if (response.success) {
        await fetchProgress();
        const currentTrackId = courses[0]?.track_id;
        if (currentTrackId) {
          await getCoursesForTrack(currentTrackId);
        }
        toast.success('Course progress has been reset');
        return true;
      } else {
        toast.error(response.error || 'Failed to reset course progress');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while resetting course progress');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProgress, getCoursesForTrack, courses]);

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
    concepts,
    conceptTree,
    isLoading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    goToPage,
    startCourse,
    updateProgress,
    resetCourse,
    getCoursesForTrack,
    getCourseById,
    toggleConceptCompletion,
    fetchConceptsForCourse,
    fetchConceptChildren,
    fetchConceptTree,
    completeConcept,
    createConcept,
    getTrackById,
  };
};