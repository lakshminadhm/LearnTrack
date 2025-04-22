import axios from 'axios';
import { 
  AuthResponse, 
  UserCredentials, 
  UserRegistration,
  AdminTrackCreate,
  AdminCourseCreate,
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
  PaginationParams,
  Concept,
  AdminConceptUpdate,
  AdminConceptCreate
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
  getTrackById: async (trackId: string): Promise<ApiResponse<LearningTrack>> => {
    try {
      const response = await api.get<ApiResponse<LearningTrack>>(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<LearningTrack>;
      }
      return { success: false, error: 'Network error occurred while fetching track details' };
    }
  },
  
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
  },

  resetCourse: async (courseId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post<ApiResponse<null>>(`/courses/${courseId}/reset`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred while resetting course' };
    }
  },

  // Concept related API methods
  getCourseConcepts: async (courseId: string): Promise<ApiResponse<Concept[]>> => {
    try {
      const response = await api.get<ApiResponse<Concept[]>>(`/courses/${courseId}/concepts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept[]>;
      }
      return { success: false, error: 'Network error occurred while fetching course concepts' };
    }
  },

  getConceptChildren: async (conceptId: string): Promise<ApiResponse<Concept[]>> => {
    try {
      const response = await api.get<ApiResponse<Concept[]>>(`/concepts/${conceptId}/children`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept[]>;
      }
      return { success: false, error: 'Network error occurred while fetching concept children' };
    }
  },

  getConceptTree: async (courseId: string): Promise<ApiResponse<Concept[]>> => {
    try {
      const response = await api.get<ApiResponse<Concept[]>>(`/courses/${courseId}/concept-tree`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept[]>;
      }
      return { success: false, error: 'Network error occurred while fetching concept tree' };
    }
  },

  completeConcept: async (conceptId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/concepts/${conceptId}/complete`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<any>;
      }
      return { success: false, error: 'Network error occurred while completing concept' };
    }
  },

  createConcept: async (data: {
    courseId: string;
    name: string;
    description?: string;
    parentId?: string;
    resourceLinks?: string[];
  }): Promise<ApiResponse<Concept>> => {
    try {
      const response = await api.post<ApiResponse<Concept>>('/concepts', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept>;
      }
      return { success: false, error: 'Network error occurred while creating concept' };
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

// Admin API
export const adminApi = {
  // Test endpoint that doesn't require authentication
  testConnection: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/test');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<any>;
      }
      return { success: false, error: 'Network error occurred while testing admin API connection' };
    }
  },

  // Tracks management
  getTracks: async (): Promise<ApiResponse<LearningTrack[]>> => {
    try {
      const response = await api.get<ApiResponse<LearningTrack[]>>('/admin/tracks');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<LearningTrack[]>;
      }
      return { success: false, error: 'Network error occurred while fetching tracks' };
    }
  },

  createTrack: async (data: AdminTrackCreate): Promise<ApiResponse<LearningTrack>> => {
    try {
      const response = await api.post<ApiResponse<LearningTrack>>('/admin/tracks', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<LearningTrack>;
      }
      return { success: false, error: 'Network error occurred while creating track' };
    }
  },

  updateTrack: async (id: string, data: AdminTrackCreate): Promise<ApiResponse<LearningTrack>> => {
    try {
      const response = await api.put<ApiResponse<LearningTrack>>(`/admin/tracks/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<LearningTrack>;
      }
      return { success: false, error: 'Network error occurred while updating track' };
    }
  },

  deleteTrack: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/tracks/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred while deleting track' };
    }
  },

  // Courses management
  getCourses: async (): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await api.get<ApiResponse<Course[]>>('/admin/courses');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course[]>;
      }
      return { success: false, error: 'Network error occurred while fetching courses' };
    }
  },

  getCourseById: async (id: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.get<ApiResponse<Course>>(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course>;
      }
      return { success: false, error: 'Network error occurred while fetching course' };
    }
  },

  createCourse: async (data: AdminCourseCreate): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.post<ApiResponse<Course>>('/admin/courses', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course>;
      }
      return { success: false, error: 'Network error occurred while creating course' };
    }
  },

  updateCourse: async (id: string, data: AdminCourseCreate): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.put<ApiResponse<Course>>(`/admin/courses/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Course>;
      }
      return { success: false, error: 'Network error occurred while updating course' };
    }
  },

  deleteCourse: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/courses/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred while deleting course' };
    }
  },

  // Concepts management for admin
  getConceptsForCourse: async (courseId: string): Promise<ApiResponse<Concept[]>> => {
    try {
      const response = await api.get<ApiResponse<Concept[]>>(`/admin/courses/${courseId}/concepts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept[]>;
      }
      return { success: false, error: 'Network error occurred while fetching concepts' };
    }
  },

  createConcept: async (data: AdminConceptCreate): Promise<ApiResponse<Concept>> => {
    try {
      const response = await api.post<ApiResponse<Concept>>('/admin/concepts', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept>;
      }
      return { success: false, error: 'Network error occurred while creating concept' };
    }
  },

  updateConcept: async (id: string, data: AdminConceptUpdate): Promise<ApiResponse<Concept>> => {
    try {
      const response = await api.put<ApiResponse<Concept>>(`/admin/concepts/${id}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<Concept>;
      }
      return { success: false, error: 'Network error occurred while updating concept' };
    }
  },

  deleteConcept: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/admin/concepts/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      return { success: false, error: 'Network error occurred while deleting concept' };
    }
  }
};

export default api;