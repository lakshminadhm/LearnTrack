import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, Filter, BookOpen, Clock, Award, ChevronRight } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useNavigate } from 'react-router-dom';
import { CourseDifficulty } from '../../../shared/src/types';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursesPage: React.FC = () => {
  const {
    tracks,
    isLoading,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    goToPage,
  } = useCourses();
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Intersection observer for animation
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredTracks = tracks.filter(track => {
    if (selectedDifficulty === 'all') return true;
    return track.courses?.some(course => course.difficulty === selectedDifficulty);
  });

  const handleTrackClick = (trackId: string) => {
    navigate(`/tracks/${trackId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading learning tracks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Tracks</h1>
          <p className="text-muted-foreground mt-1">
            Explore our curated learning paths and start your journey
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border bg-background text-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center text-gray-700 dark:text-gray-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-card rounded-lg p-4 border"
        >
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input bg-muted"
              >
                <option value="all" className='text-muted-foreground'>All Levels</option>
                {Object.values(CourseDifficulty).map((difficulty) => (
                  <option key={difficulty} value={difficulty} className='text-muted-foreground'>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {filteredTracks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No tracks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTracks.map((track) => (
            <motion.div
              key={track.id}
              variants={itemVariants}
              className="group cursor-pointer"
              onClick={() => handleTrackClick(track.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg hover:border-primary flex flex-col h-full">
                <div className="p-4 h-full flex flex-col justify-between">
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {track.description}
                  </p>
                  
                  {track.courses && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {track.courses.reduce((acc, course) => acc + course.duration_hours, 0)} hours total
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Award className="h-4 w-4 mr-2" />
                        <span>
                          {track.courses.length} {track.courses.length === 1 ? 'course' : 'courses'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-muted border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">View Track</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`btn ${
                currentPage === page ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;