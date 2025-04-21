import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalCreate } from '../../../shared/src/types';
import { goalsApi } from '../services/api';
import toast from 'react-hot-toast';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await goalsApi.getGoals();
      
      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        setError(response.error || 'Failed to fetch goals');
        toast.error(response.error || 'Failed to fetch goals');
      }
    } catch (err) {
      setError('An error occurred while fetching goals');
      toast.error('An error occurred while fetching goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(async (goalData: GoalCreate) => {
    setIsLoading(true);
    
    try {
      const response = await goalsApi.createGoal(goalData);
      
      if (response.success && response.data) {
        setGoals(prevGoals => [...prevGoals, response.data!]);
        toast.success('Goal created successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create goal');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while creating the goal');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (id: string, goalData: GoalCreate) => {
    setIsLoading(true);
    
    try {
      const response = await goalsApi.updateGoal(id, goalData);
      
      if (response.success && response.data) {
        setGoals(prevGoals => 
          prevGoals.map(goal => goal.id === id ? response.data! : goal)
        );
        toast.success('Goal updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update goal');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while updating the goal');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const response = await goalsApi.deleteGoal(id);
      
      if (response.success) {
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
        toast.success('Goal deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete goal');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while deleting the goal');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal
  };
};