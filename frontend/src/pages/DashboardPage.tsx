import React, { useState } from 'react';
import { 
  RefreshCw, Calendar, BarChart2, Award, 
  BookOpen, Target, Clock, ArrowRight
} from 'lucide-react';
import StreakChart from '../components/Dashboard/StreakChart';
import ProgressSummary from '../components/Dashboard/ProgressSummary';
import TechBreakdown from '../components/Dashboard/TechBreakdown';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCourses } from '../hooks/useCourses';
import { useGoals } from '../hooks/useGoals';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const DashboardPage: React.FC = () => {
  const { 
    streak, 
    progress, 
    techBreakdown, 
    isLoading, 
    fetchAllAnalytics 
  } = useAnalytics();
  
  const { courses } = useCourses();
  const { goals } = useGoals();
  
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  
  React.useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  // Calculate some summary statistics
  const activeCourses = courses?.filter(course => course.status === 'in_progress') || [];
  const completedCourses = courses?.filter(course => course.status === 'completed') || [];
  const upcomingGoals = goals?.filter(goal => new Date(goal.due_date) > new Date()) || [];
  
  // Calculate current streak
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  
  // Calculate total learning hours
  const totalHours = Array.isArray(progress) 
    ? progress.reduce((total, item) => total + (item.hours || 0), 0) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header with summary cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your learning progress and stay on top of your goals
            </p>
          </div>
          <Button
            onClick={() => fetchAllAnalytics()}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        
        {/* Quick stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated" hoverEffect>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}</h3>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">days</p>
                  </div>
                </div>
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Calendar size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <Badge variant="success" className="mt-4" size="sm">
                {currentStreak > 0 ? 'Active' : 'Start Today!'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card variant="elevated" hoverEffect>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Hours</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalHours.toFixed(1)}</h3>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">hours</p>
                  </div>
                </div>
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-full">
                  <Clock size={20} className="text-secondary-600 dark:text-secondary-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {totalHours > 0 ? `That's ${(totalHours / 24).toFixed(1)} days of learning!` : 'Start logging your hours'}
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" hoverEffect>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Courses</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCourses.length}</h3>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">in progress</p>
                  </div>
                </div>
                <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-full">
                  <BookOpen size={20} className="text-accent-600 dark:text-accent-400" />
                </div>
              </div>
              <Link to="/courses" className="mt-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
                View all courses
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </CardContent>
          </Card>
          
          <Card variant="elevated" hoverEffect>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Goals</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingGoals.length}</h3>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">goals</p>
                  </div>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Target size={20} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <Link to="/goals" className="mt-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
                Manage goals
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Streak and tech breakdown section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" variant="bordered">
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
            <CardDescription>
              Your daily learning activity over time
            </CardDescription>
            <div className="flex space-x-2 mt-2">
              <Button 
                size="sm" 
                variant={timeframe === 'week' ? 'primary' : 'outline'} 
                onClick={() => setTimeframe('week')}
              >
                Week
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === 'month' ? 'primary' : 'outline'} 
                onClick={() => setTimeframe('month')}
              >
                Month
              </Button>
              <Button 
                size="sm" 
                variant={timeframe === 'year' ? 'primary' : 'outline'} 
                onClick={() => setTimeframe('year')}
              >
                Year
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <StreakChart streak={streak} isLoading={isLoading} timeframe={timeframe} />
          </CardContent>
          <CardFooter className="border-t border-gray-200 dark:border-gray-800 flex justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current streak: <span className="font-semibold text-gray-900 dark:text-white">{currentStreak} days</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Longest streak: <span className="font-semibold text-gray-900 dark:text-white">{longestStreak} days</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Technology Breakdown</CardTitle>
            <CardDescription>
              Distribution of your learning subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TechBreakdown techData={techBreakdown} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
      
      {/* Progress summary section */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>
            Track your progress across different courses and learning tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressSummary progress={progress} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <strong>{completedCourses.length}</strong> courses completed
            </span>
            <Link to="/courses">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                View All Courses
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardPage;