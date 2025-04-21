// User interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  role?: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  username: string;
}

// Authentication interfaces
export interface AuthResponse {
  user: User;
  token: string;
}

// Log interfaces
export interface Log {
  id: string;
  user_id: string;
  date: string;
  technology: string;
  hours_spent: number;
  notes: string;
  created_at: Date;
}

export interface LogCreate {
  date: string;
  technology: string;
  hours_spent: number;
  notes: string;
}

// Goal interfaces
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  technology: string;
  status: GoalStatus;
  created_at: Date;
  updated_at: Date;
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface GoalCreate {
  title: string;
  description: string;
  target_date: string;
  technology: string;
  status: GoalStatus;
}

// Concept interfaces for hierarchical structure
export interface Concept {
  id: string;
  parent_id: string | null;
  course_id: string;
  name: string;
  description: string | null;
  is_completed: boolean;
  resource_links: string[] | null;
  created_at: string;
  updated_at: string;
  progress?: UserConceptProgress | null;
  children?: Concept[]; // For hierarchical structure
}

export interface UserConceptProgress {
  id: string;
  user_id: string;
  concept_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Course interfaces
export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  courses?: Course[];
}

export interface Course {
  id: string;
  track_id: string;
  title: string;
  description: string;
  duration_hours: number;
  difficulty: CourseDifficulty;
  created_at: Date;
  concepts?: Concept[];
  progress?: UserCourseProgress;
}

export enum CourseDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum CourseStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  status: CourseStatus;
  progress_percentage: number;
  updated_at: Date;
}

// Community interfaces
export interface Post {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: Date;
  username?: string;
  replies?: Post[];
}

export interface PostCreate {
  content: string;
  parent_id?: string;
}

// Analytics interfaces
export interface Streak {
  current: number;
  longest: number;
  dates: string[];
}

export interface Progress {
  total_hours: number;
  total_logs: number;
  recent_logs: Log[];
  course_stats?: {
    total: number;
    completed: number;
  };
}

export interface TechBreakdown {
  technology: string;
  hours: number;
  percentage: number;
}

// API Response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination interfaces
export interface PaginationParams {
  limit: number;
  offset: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// Admin interfaces
export interface AdminTrackCreate {
  title: string;
  description: string;
}

export interface AdminTrackUpdate extends AdminTrackCreate {
  id: string;
}

export interface AdminCourseCreate {
  track_id: string;
  title: string;
  description: string;
  duration_hours: number;
  difficulty: CourseDifficulty;
}

export interface AdminCourseUpdate extends AdminCourseCreate {
  id: string;
}

export interface AdminConceptCreate {
  course_id: string;
  parent_id?: string;
  name: string;
  description?: string;
  resource_links?: string[];
}

export interface AdminConceptUpdate extends AdminConceptCreate {
  id: string;
}