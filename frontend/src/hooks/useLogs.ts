import { useState, useEffect, useCallback } from 'react';
import { Log, LogCreate } from '../../../shared/src/types';
import { logsApi } from '../services/api';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

interface PaginatedLogs {
  data: Log[];
  total: number;
}

interface UseLogsOptions {
  limit?: number;
  initialPage?: number;
}

export const useLogs = (options: UseLogsOptions = {}) => {
  const { limit = 10, initialPage = 1 } = options;
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchLogs = useCallback(async (page: number, search?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * limit;
      const response = await logsApi.getLogs({ limit, offset, search });
      
      if (response.success && response.data) {
        const { data, total } = response.data as PaginatedLogs;
        setLogs(data);
        setTotalLogs(total);
      } else {
        setError(response.error || 'Failed to fetch logs');
        toast.error(response.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError('An error occurred while fetching logs');
      toast.error('An error occurred while fetching logs');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setCurrentPage(1); // Reset to first page on search
      fetchLogs(1, search);
    }, 300),
    [fetchLogs]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchLogs(currentPage);
    }
  }, [currentPage, searchTerm, debouncedSearch, fetchLogs]);

  const createLog = useCallback(async (logData: LogCreate) => {
    setIsLoading(true);
    
    try {
      const response = await logsApi.createLog(logData);
      
      if (response.success && response.data) {
        // Refresh the current page after creating a new log
        fetchLogs(currentPage, searchTerm);
        toast.success('Log created successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create log');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while creating the log');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, fetchLogs]);

  const updateLog = useCallback(async (id: string, logData: LogCreate) => {
    setIsLoading(true);
    
    try {
      const response = await logsApi.updateLog(id, logData);
      
      if (response.success && response.data) {
        // Refresh the current page after updating
        fetchLogs(currentPage, searchTerm);
        toast.success('Log updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update log');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while updating the log');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, fetchLogs]);

  const deleteLog = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const response = await logsApi.deleteLog(id);
      
      if (response.success) {
        // Refresh the current page after deleting
        fetchLogs(currentPage, searchTerm);
        toast.success('Log deleted successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete log');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while deleting the log');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, fetchLogs]);

  const totalPages = Math.ceil(totalLogs / limit);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    logs,
    isLoading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    goToPage,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog
  };
};