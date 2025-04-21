import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { Layout, Library, Book, ListTree, Settings, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { tracks, isLoading } = useCourses();

  const adminSections = [
    { 
      title: 'Learning Tracks', 
      description: 'Manage learning tracks for different subjects and technologies',
      icon: <Layout className="w-8 h-8 text-indigo-500" />,
      count: isLoading ? '...' : tracks.length,
      link: '/admin/tracks',
      color: 'bg-indigo-100'
    },
    { 
      title: 'Courses', 
      description: 'Manage courses within learning tracks',
      icon: <Library className="w-8 h-8 text-green-500" />,
      link: '/admin/courses',
      color: 'bg-green-100'
    },
    { 
      title: 'Course Content', 
      description: 'Manage concepts, subconcepts, and learning materials',
      icon: <ListTree className="w-8 h-8 text-blue-500" />,
      link: '/admin/concepts',
      color: 'bg-blue-100'
    },
    { 
      title: 'User Management', 
      description: 'Manage user accounts and permissions',
      icon: <Users className="w-8 h-8 text-purple-500" />,
      link: '/admin/users',
      color: 'bg-purple-100',
      soon: true
    },
    { 
      title: 'Settings', 
      description: 'Configure system settings and preferences',
      icon: <Settings className="w-8 h-8 text-gray-500" />,
      link: '/admin/settings',
      color: 'bg-gray-100',
      soon: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`p-4 ${section.color}`}>
              {section.icon}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                {section.title}
                {section.soon && (
                  <span className="ml-2 text-xs font-medium px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                    Coming Soon
                  </span>
                )}
              </h3>
              <p className="text-gray-600 mb-4">{section.description}</p>
              {section.count !== undefined && (
                <div className="mb-4 text-2xl font-bold text-gray-800">
                  {section.count} {section.count === 1 ? 'item' : 'items'}
                </div>
              )}
              {!section.soon ? (
                <Link
                  to={section.link}
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Manage
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-block px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;