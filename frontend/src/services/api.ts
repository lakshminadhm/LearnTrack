import axios from 'axios';
import { 
  AuthResponse, 
  UserCredentials, 
  UserRegistration,
  ApiResponse,
  Streak,
  Progress,
  TechBreakdown,
  Goal,
  GoalCreate,
  Log,
  LogCreate,
  Post,
  PostCreate,
  LearningTrack,
  Course,
  UserCourseProgress,
  PaginatedResponse,
  PaginationParams
} from '../../../shared/src/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authApi = {
  login: async (credentials: UserCredentials): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<AuthResponse>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  register: async (userData: UserRegistration): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<AuthResponse>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/logout');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  }
};

// Analytics API
export const analyticsApi = {
  getStreaks: async (): Promise<ApiResponse<Streak>> => {
    try {
      const response = await api.get<ApiResponse<Streak>>('/analytics/streaks');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Streak>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  getProgress: async (): Promise<ApiResponse<Progress>> => {
    try {
      const response = await api.get<ApiResponse<Progress>>('/analytics/progress');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Progress>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  getTechBreakdown: async (): Promise<ApiResponse<TechBreakdown[]>> => {
    try {
      const response = await api.get<ApiResponse<TechBreakdown[]>>('/analytics/tech-breakdown');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<TechBreakdown[]>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  }
};

// Goals API
export const goalsApi = {
  getGoals: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Goal>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Goal>>>('/goals', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<PaginatedResponse<Goal>>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  createGoal: async (goalData: GoalCreate): Promise<ApiResponse<Goal>> => {
    try {
      const response = await api.post<ApiResponse<Goal>>('/goals', goalData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Goal>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  updateGoal: async (id: string, goalData: GoalCreate): Promise<ApiResponse<Goal>> => {
    try {
      const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Goal>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  deleteGoal: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/goals/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  }
};

// Logs API
export const logsApi = {
  getLogs: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Log>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Log>>>('/logs', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<PaginatedResponse<Log>>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  createLog: async (logData: LogCreate): Promise<ApiResponse<Log>> => {
    try {
      const response = await api.post<ApiResponse<Log>>('/logs', logData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Log>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  updateLog: async (id: string, logData: LogCreate): Promise<ApiResponse<Log>> => {
    try {
      const response = await api.put<ApiResponse<Log>>(`/logs/${id}`, logData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Log>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  deleteLog: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/logs/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  }
};

// Courses API
export const coursesApi = {
  getTracks: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<LearningTrack>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<LearningTrack>>>('/tracks', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<PaginatedResponse<LearningTrack>>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  getCourses: async (trackId: string): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await api.get<ApiResponse<Course[]>>(`/tracks/${trackId}/courses`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course[]>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  getCourseById: async (courseId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.get<ApiResponse<Course>>(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course>;
      }
      return { success: false, error: 'Network error occurred while fetching course details' };
    }
  },

  startCourse: async (courseId: string): Promise<ApiResponse<UserCourseProgress>> => {
    const response = await api.post<ApiResponse<UserCourseProgress>>(`/courses/start`, { courseId });
    return response.data;
  },

  updateProgress: async (courseId: string, progress: number): Promise<ApiResponse<UserCourseProgress>> => {
    try {
      const response = await api.put<ApiResponse<UserCourseProgress>>(`/courses/progress/${courseId}`, { progress });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserCourseProgress>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  getProgress: async (): Promise<ApiResponse<UserCourseProgress[]>> => {
    try {
      const response = await api.get<ApiResponse<UserCourseProgress[]>>('/courses/progress');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<UserCourseProgress[]>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  toggleConcept: async (courseId: string, conceptId: string, isCompleted: boolean): Promise<ApiResponse<null>> => {
    try {
      const response = await api.put<ApiResponse<null>>(`/courses/${courseId}/concepts/${conceptId}/toggle`, { isCompleted });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred while updating concept status' };
    }
  }
};

// Community API
export const communityApi = {
  getPosts: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Post>>>('/community/posts', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<PaginatedResponse<Post>>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  createPost: async (postData: PostCreate): Promise<ApiResponse<Post>> => {
    try {
      const response = await api.post<ApiResponse<Post>>('/community/posts', postData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Post>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  },

  createReply: async (postId: string, replyData: PostCreate): Promise<ApiResponse<Post>> => {
    try {
      const response = await api.post<ApiResponse<Post>>(`/community/posts/${postId}/reply`, replyData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Post>;
      }
      return { success: false, error: 'Network error occurred' };
    }
  }
};

export default api;