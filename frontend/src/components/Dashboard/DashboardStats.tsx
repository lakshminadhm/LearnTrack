import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description }) => (
  <motion.div 
    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-300"
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  </motion.div>
);

interface DashboardStatsProps {
  totalHours: number;
  totalLogs: number;
  dailyAverage: number;
  coursesCompleted: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalHours,
  totalLogs,
  dailyAverage,
  coursesCompleted,
}) => {
  const stats = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Total Hours',
      value: `${totalHours}h`,
      description: 'Time invested in learning',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Total Logs',
      value: totalLogs,
      description: 'Learning sessions recorded',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Daily Average',
      value: `${dailyAverage}h`,
      description: 'Average time per session',
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Courses Completed',
      value: coursesCompleted,
      description: 'Learning tracks progress',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;