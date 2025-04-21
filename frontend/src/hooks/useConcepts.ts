import { useState, useEffect, useCallback } from 'react';
import { Concept } from '../../../shared/src/types';
import { conceptsApi } from '../services/api';
import toast from 'react-hot-toast';

export const useConcepts = (courseId: string) => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchConcepts = useCallback(async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      const response = await conceptsApi.getConcepts(courseId);
      if (response.success && response.data) {
        setConcepts(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch concepts');
      }
    } catch (error) {
      toast.error('An error occurred while fetching concepts');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchConcepts();
  }, [fetchConcepts]);

  const toggleConceptComplete = async (conceptId: string) => {
    setIsLoading(true);
    try {
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) return;

      const response = await conceptsApi.updateProgress(conceptId, !concept.is_completed);
      if (response.success) {
        setConcepts(prevConcepts =>
          prevConcepts.map(c =>
            c.id === conceptId ? { ...c, is_completed: !c.is_completed } : c
          )
        );
        toast.success(
          concept.is_completed ? 'Concept marked as incomplete' : 'Concept marked as complete'
        );
      } else {
        toast.error(response.error || 'Failed to update concept progress');
      }
    } catch (error) {
      toast.error('An error occurred while updating concept progress');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    concepts,
    isLoading,
    fetchConcepts,
    toggleConceptComplete
  };
};