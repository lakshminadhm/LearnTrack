import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart2, Target, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <ClipboardList className="w-12 h-12 text-indigo-600" />,
      title: 'Daily Logs',
      description: 'Keep track of what you learn every day. Log your hours, technologies, and notes to build a comprehensive learning diary.'
    },
    {
      icon: <BarChart2 className="w-12 h-12 text-indigo-600" />,
      title: 'Analytics Dashboard',
      description: 'Visualize your learning journey with charts and statistics. Track your streaks, see your progress, and analyze your focus areas.'
    },
    {
      icon: <Target className="w-12 h-12 text-indigo-600" />,
      title: 'Goal Setting',
      description: 'Set meaningful learning goals with deadlines. Break down your career objectives into achievable milestones.'
    },
    {
      icon: <Users className="w-12 h-12 text-indigo-600" />,
      title: 'Community',
      description: 'Share your journey, ask questions, and connect with other learners. Learn from each other\'s experiences and challenges.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 py-20 text-white mb-12 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Track Your Learning Journey
              </h1>
              <p className="text-xl mb-8 text-indigo-100">
                LearnTrack helps you monitor your daily progress, set goals, and visualize your growth as you master new technologies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-block bg-white text-indigo-700 font-medium px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-block bg-white text-indigo-700 font-medium px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="inline-block border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-300 mr-4" />
                  <div>
                    <h3 className="font-medium">Today's Progress</h3>
                    <p className="text-sm text-indigo-200">JavaScript: 2.5 hours</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white bg-opacity-20 rounded-full mb-4">
                  <div className="h-2 bg-green-400 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">14</div>
                    <div className="text-xs text-indigo-200">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">86</div>
                    <div className="text-xs text-indigo-200">Total Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-indigo-200">Technologies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            Track, Analyze, and Achieve
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-light dark:bg-surface-dark py-16 rounded-xl mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Ready to Level Up Your Learning?
          </h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers who use LearnTrack to stay consistent, track progress, and reach their learning goals.
          </p>
          {isAuthenticated ? (
            <Link
              to="/logs"
              className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Logging
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;