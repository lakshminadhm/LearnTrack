import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Calendar, BarChart2, Award,
  BookOpen, Target, Clock, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import StreakChart from '../components/Dashboard/StreakChart';
import ProgressSummary from '../components/Dashboard/ProgressSummary';
import TechBreakdown from '../components/Dashboard/TechBreakdown';

import { useAnalytics } from '../hooks/useAnalytics';
import { useCourses } from '../hooks/useCourses';
import { useGoals } from '../hooks/useGoals';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6
    }
  })
};

const DashboardPage: React.FC = () => {
  const { streak, progress, techBreakdown, isLoading, fetchAllAnalytics } = useAnalytics();
  const { courses } = useCourses();
  const { goals } = useGoals();

  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const activeCourses = courses?.filter(course => course.status === 'in_progress') || [];
  const completedCourses = courses?.filter(course => course.status === 'completed') || [];
  const upcomingGoals = goals?.filter(goal => new Date(goal.due_date) > new Date()) || [];

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  const totalHours = Array.isArray(progress)
    ? progress.reduce((total, item) => total + (item.hours || 0), 0)
    : 0;

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div variants={fadeIn}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your learning progress and stay on top of your goals
            </p>
          </div>
          <Button
            onClick={fetchAllAnalytics}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={fadeIn}
      >
        {/* Use map for cleaner animation if you want to animate each card independently */}
        {[{
          title: "Current Streak",
          value: currentStreak,
          unit: "days",
          icon: <Calendar size={20} className="text-primary-600 dark:text-primary-400" />,
          badge: currentStreak > 0 ? "Active" : "Start Today!"
        }, {
          title: "Learning Hours",
          value: totalHours.toFixed(1),
          unit: "hours",
          icon: <Clock size={20} className="text-secondary-600 dark:text-secondary-400" />,
          note: totalHours > 0 ? `That's ${(totalHours / 24).toFixed(1)} days of learning!` : 'Start logging your hours'
        }, {
          title: "Active Courses",
          value: activeCourses.length,
          unit: "in progress",
          icon: <BookOpen size={20} className="text-accent-600 dark:text-accent-400" />,
          link: "/courses",
          linkLabel: "View all courses"
        }, {
          title: "Upcoming Goals",
          value: upcomingGoals.length,
          unit: "goals",
          icon: <Target size={20} className="text-green-600 dark:text-green-400" />,
          link: "/goals",
          linkLabel: "Manage goals"
        }].map((card, i) => (
          <motion.div key={card.title} custom={i} variants={fadeIn}>
            <Card variant="elevated" hoverEffect>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                    <div className="flex items-baseline">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                      <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{card.unit}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {card.icon}
                  </div>
                </div>
                {card.badge && <Badge variant="success" className="mt-4" size="sm">{card.badge}</Badge>}
                {card.note && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{card.note}</p>}
                {card.link && (
                  <Link to={card.link} className="mt-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    {card.linkLabel}
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={fadeIn}>
        <Card className="lg:col-span-2" variant="bordered">
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
            <CardDescription>Your daily learning activity over time</CardDescription>
            <div className="flex space-x-2 mt-2 text-gray-600 dark:text-gray-400">
              {['week', 'month', 'year'].map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeframe === tf ? 'primary' : 'outline'}
                  onClick={() => setTimeframe(tf as any)}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <StreakChart streak={streak} isLoading={isLoading} timeframe={timeframe} />
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-5 border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current streak: <strong>{currentStreak} days</strong>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Longest streak: <strong>{longestStreak} days</strong>
            </div>
          </CardFooter>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Technology Breakdown</CardTitle>
            <CardDescription>Distribution of your learning subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <TechBreakdown techData={techBreakdown} isLoading={isLoading} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Section */}
      <motion.div variants={fadeIn}>
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Track your progress across different courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressSummary progress={progress} isLoading={isLoading} />
          </CardContent>
          <CardFooter className="border-t border-gray-200 pt-5 dark:border-gray-800 flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <strong>{completedCourses.length}</strong> courses completed
            </span>
            <Link to="/courses">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />} className='text-gray-700 dark:text-gray-300'>
                View All Courses
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
