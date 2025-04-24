import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

interface TopbarProps {
  setSidebarOpen: (val: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (val: boolean) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  setSidebarOpen,
  userMenuOpen,
  setUserMenuOpen,
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-gray-200 dark:border-gray-800 md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="ml-3 flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-primary-600 dark:text-primary-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">LearnTrack</span>
          </Link>
        </div>

        {user && (
          <div className="relative" data-user-menu>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Avatar size="sm" src={user.avatar_url} alt={user.display_name || user.email || "User"} />
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-elevation-medium dark:shadow-elevation-medium-dark border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.display_name || user.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
