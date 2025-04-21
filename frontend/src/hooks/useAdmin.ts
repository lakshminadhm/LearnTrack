import { useState, useEffect, useCallback } from 'react';
import { LearningTrack, Course, AdminTrackCreate, AdminTrackUpdate, AdminCourseCreate, AdminCourseUpdate } from '../../../shared/src/types';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTracks();
      if (response.success && response.data) {
        setTracks(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch tracks');
      }
    } catch (error) {
      toast.error('An error occurred while fetching tracks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch courses');
      }
    } catch (error) {
      toast.error('An error occurred while fetching courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
    fetchCourses();
  }, [fetchTracks, fetchCourses]);

  const createTrack = async (data: AdminTrackCreate) => {
    setIsLoading(true);
    try {
      const response = await adminApi.createTrack(data);
      if (response.success && response.data) {
        setTracks(prev => [...prev, response.data!]);
        toast.success('Track created successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create track');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while creating track');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrack = async (data: AdminTrackUpdate) => {
    setIsLoading(true);
    try {
      const response = await adminApi.updateTrack(data.id, data);
      if (response.success && response.data) {
        setTracks(prev => prev.map(track => 
          track.id === data.id ? response.data! : track
        ));
        toast.success('Track updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update track');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating track');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrack = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await adminApi.deleteTrack(id);
      if (response.success) {
        setTracks(prev => prev.filter(track => track.id !== id));
        toast.success('Track deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete track');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while deleting track');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async (data: AdminCourseCreate) => {
    setIsLoading(true);
    try {
      const response = await adminApi.createCourse(data);
      if (response.success && response.data) {
        setCourses(prev => [...prev, response.data!]);
        toast.success('Course created successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create course');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while creating course');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (data: AdminCourseUpdate) => {
    setIsLoading(true);
    try {
      const response = await adminApi.updateCourse(data.id, data);
      if (response.success && response.data) {
        setCourses(prev => prev.map(course => 
          course.id === data.id ? response.data! : course
        ));
        toast.success('Course updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update course');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while updating course');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await adminApi.deleteCourse(id);
      if (response.success) {
        setCourses(prev => prev.filter(course => course.id !== id));
        toast.success('Course deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete course');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while deleting course');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tracks,
    courses,
    isLoading,
    createTrack,
    updateTrack,
    deleteTrack,
    createCourse,
    updateCourse,
    deleteCourse
  };
};