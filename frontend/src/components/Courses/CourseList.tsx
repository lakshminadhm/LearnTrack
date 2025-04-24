import React, { useState } from 'react';
import { Course } from '../../types';
import { BookOpen, Search, Filter, X, Check, RefreshCw } from 'lucide-react';
import CourseItem from './CourseItem';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface CourseListProps {
  courses: Course[];
  onEnroll: (courseId: string) => Promise<void>;
  onUpdateProgress: (courseId: string, progress: number) => Promise<void>;
  onReset?: (courseId: string) => Promise<void>;
  isLoading: boolean;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'title' | 'difficulty' | 'duration' | 'progress';

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEnroll,
  onUpdateProgress,
  onReset,
  isLoading
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [difficultyFilters, setDifficultyFilters] = useState<string[]>([]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle difficulty filter toggle
  const toggleDifficultyFilter = (difficulty: string) => {
    if (difficultyFilters.includes(difficulty)) {
      setDifficultyFilters(difficultyFilters.filter(d => d !== difficulty));
    } else {
      setDifficultyFilters([...difficultyFilters, difficulty]);
    }
  };
  
  // Get all available difficulties from courses
  const availableDifficulties = [...new Set(courses.map(course => course.difficulty))];
  
  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    // First apply search filter
    let filtered = courses.filter(course => {
      if (searchQuery === '') return true;
      return (
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    
    // Then apply difficulty filters if any
    if (difficultyFilters.length > 0) {
      filtered = filtered.filter(course => difficultyFilters.includes(course.difficulty));
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          // Custom difficulty sorting logic (BEGINNER, INTERMEDIATE, ADVANCED)
          const difficultyOrder = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3 };
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        case 'duration':
          return a.duration_hours - b.duration_hours;
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });
  }, [courses, searchQuery, difficultyFilters, sortBy]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6 animate-pulse",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} variant="bordered">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="pt-4 flex justify-between">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Render empty state
  if (!courses.length) {
    return (
      <Card variant="bordered" className="text-center py-16">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No courses available</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a learning track to view its courses or try a different search
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} />}
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setDifficultyFilters([]);
            }}
          >
            Reset filters
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Render empty search results
  if (filteredAndSortedCourses.length === 0 && (searchQuery || difficultyFilters.length > 0)) {
    return (
      <div className="space-y-6">
        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              leftIcon={<Search size={18} className="text-gray-500" />}
              rightIcon={
                searchQuery ? (
                  <button onClick={() => setSearchQuery('')}>
                    <X size={18} className="text-gray-500 hover:text-gray-700" />
                  </button>
                ) : undefined
              }
              fullWidth
            />
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Filter size={18} />}
              onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
            >
              Filter
              {difficultyFilters.length > 0 && (
                <Badge variant="primary" size="sm" rounded className="ml-2">
                  {difficultyFilters.length}
                </Badge>
              )}
            </Button>
            
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
              <button
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'grid' 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              </button>
              <button
                className={cn(
                  "p-2 transition-colors",
                  viewMode === 'list' 
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => setViewMode('list')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters panel */}
        {filtersPanelOpen && (
          <Card variant="bordered" className="p-4 mb-6 animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDifficultyFilters([])}
              >
                Reset
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Difficulty</h4>
                <div className="flex flex-wrap gap-2">
                  {availableDifficulties.map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => toggleDifficultyFilter(difficulty)}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        difficultyFilters.includes(difficulty)
                          ? "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {difficultyFilters.includes(difficulty) && (
                        <Check size={12} className="mr-1" />
                      )}
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Sort by</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'title', label: 'Title' },
                    { value: 'difficulty', label: 'Difficulty' },
                    { value: 'duration', label: 'Duration' },
                    { value: 'progress', label: 'Progress' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        sortBy === option.value
                          ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        <Card variant="bordered" className="text-center py-16">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No matching courses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilters([]);
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<Search size={18} className="text-gray-500" />}
            rightIcon={
              searchQuery ? (
                <button onClick={() => setSearchQuery('')}>
                  <X size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              ) : undefined
            }
            fullWidth
          />
        </div>
        
        <div className="flex gap-2 flex-shrink-0 text-gray-700 dark:text-gray-300">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Filter size={18} />}
            onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
          >
            Filter
            {difficultyFilters.length > 0 && (
              <Badge variant="primary" size="sm" rounded className="ml-2">
                {difficultyFilters.length}
              </Badge>
            )}
          </Button>
          
          <div className="flex border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid' 
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              onClick={() => setViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <button
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list' 
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              onClick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters panel */}
      {filtersPanelOpen && (
        <Card variant="bordered" className="p-4 mb-6 animate-slide-down text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDifficultyFilters([])}
            >
              Reset
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Difficulty</h4>
              <div className="flex flex-wrap gap-2">
                {availableDifficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => toggleDifficultyFilter(difficulty)}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      difficultyFilters.includes(difficulty)
                        ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {difficultyFilters.includes(difficulty) && (
                      <Check size={12} className="mr-1" />
                    )}
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Sort by</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'title', label: 'Title' },
                  { value: 'difficulty', label: 'Difficulty' },
                  { value: 'duration', label: 'Duration' },
                  { value: 'progress', label: 'Progress' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      sortBy === option.value
                        ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedCourses.length} of {courses.length} courses
      </div>
      
      {/* Course grid or list */}
      <div className={cn(
        "grid gap-6 animate-fade-in",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {filteredAndSortedCourses.map((course) => (
          <CourseItem 
            key={course.id} 
            course={course} 
            onStartCourse={onEnroll}
            onResetCourse={onReset}
            onUpdateProgress={onUpdateProgress}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CourseList);
