import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  Home,
  Target,
  LineChart,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (val: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  userMenuOpen,
  setUserMenuOpen
}) => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { mode, setMode, isDark } = useTheme();

  const navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Goals', path: '/goals', icon: <Target className="w-5 h-5" /> },
    { label: 'Learning Logs', path: '/logs', icon: <LineChart className="w-5 h-5" /> },
    { label: 'Community', path: '/community', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Admin Dashboard', path: '/admin', icon: <Settings className="w-5 h-5" />, admin: true },
  ];
  
  const fullNavigation = isAdmin ? navigation : navigation.filter(n => !n.admin);

  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    setSidebarOpen(false);
  }, [location, setSidebarOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (userMenuOpen && !target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen, setUserMenuOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex group flex-col fixed inset-y-0 z-50 w-16 hover:w-64 transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              LearnTrack
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between py-4">
          <nav className="flex-1 px-3 space-y-1">
            {fullNavigation.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  "flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors group",
                  location.pathname.startsWith(item.path)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="text-gray-600 dark:text-gray-400 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="ml-3 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {user && (
            <div className="px-3 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  )}
                </div>
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              {/* Profile Button */}
              <Link
                to="/profile"
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <Avatar
                    size="sm"
                    src={user.avatar_url}
                    alt={user.display_name || user.email || "User"}
                    status={user.is_online ? "online" : "offline"}
                  />
                </div>
                <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.display_name || user.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role === 'admin' ? 'Administrator' : 'Learner'}
                  </p>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Sign out
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-gray-800 transform transition-transform duration-normal ease-in-out md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-600">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearnTrack</span>
          </Link>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {fullNavigation.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={cn(
                  "flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname.startsWith(item.path)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {user && (
            <div className="px-3 py-4 space-y-2 border-t border-gray-200 dark:border-gray-600">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  )}
                </div>
                <span className="ml-3">{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>

              {/* Profile Button */}
              <Link
                to="/profile"
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <Avatar
                    size="sm"
                    src={user.avatar_url}
                    alt={user.display_name || user.email || "User"}
                    status={user.is_online ? "online" : "offline"}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.display_name || user.email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role === 'admin' ? 'Administrator' : 'Learner'}
                  </p>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="ml-3">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;