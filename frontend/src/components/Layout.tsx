import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useLocation, Link } from 'react-router-dom';
import { 
  Menu, X, Home, BookOpen, Target, LineChart, 
  MessageSquare, Settings, ChevronRight, LogOut, Moon, Sun, 
  User, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  admin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { mode, setMode, isDark } = useTheme();
  
  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-user-menu]')) {
          setUserMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);
  
  const navigation: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { label: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { label: 'Goals', path: '/goals', icon: <Target size={20} /> },
    { label: 'Learning Logs', path: '/logs', icon: <LineChart size={20} /> },
    { label: 'Community', path: '/community', icon: <MessageSquare size={20} /> },
  ];
  
  const adminNav: NavItem[] = [
    { label: 'Admin Dashboard', path: '/admin', icon: <Settings size={20} />, admin: true },
  ];
  
  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };
  
  const fullNavigation = isAdmin ? [...navigation, ...adminNav] : navigation;
  
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark transition-colors duration-normal">
      {/* Sidebar for desktop */}
      <div className={cn(
        "hidden lg:flex lg:w-64 flex-col fixed inset-y-0 z-50 border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark transition-all duration-normal",
      )}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearnTrack</span>
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {fullNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors group",
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="px-3 mt-6 space-y-3">
            <button 
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun size={18} className="mr-3 text-amber-500" />
              ) : (
                <Moon size={18} className="mr-3 text-indigo-500" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center px-3 py-3">
                  <Avatar 
                    size="sm"
                    src={user.avatar_url}
                    alt={user.display_name || user.email || "User"}
                    status={user.is_online ? "online" : "offline"}
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.display_name || user.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' ? 'Administrator' : 'Learner'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 justify-start text-gray-700 dark:text-gray-300"
                  leftIcon={<LogOut size={16} />}
                  onClick={logout}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-surface-light dark:bg-surface-dark transform transition-transform duration-normal ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-0 right-0 pt-4 pr-4 flex">
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">LearnTrack</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="px-3 space-y-1">
            {fullNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="px-3 mt-6 space-y-3">
            <button 
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun size={18} className="mr-3 text-amber-500" />
              ) : (
                <Moon size={18} className="mr-3 text-indigo-500" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            
            {user && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center px-3 py-3">
                  <Avatar 
                    size="sm"
                    src={user.avatar_url}
                    alt={user.display_name || user.email || "User"}
                  />
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.display_name || user.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' ? 'Administrator' : 'Learner'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-1 justify-start text-gray-700 dark:text-gray-300"
                  leftIcon={<LogOut size={16} />}
                  onClick={logout}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile top header */}
        <div className="sticky top-0 z-10 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                type="button"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="ml-3 flex items-center space-x-2">
                <BookOpen className="h-7 w-7 text-primary-600 dark:text-primary-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">LearnTrack</span>
              </Link>
            </div>
            
            {/* Mobile user menu */}
            {user && (
              <div className="relative" data-user-menu>
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar 
                    size="sm"
                    src={user.avatar_url}
                    alt={user.display_name || user.email || "User"}
                  />
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
        
        {/* Main content */}
        <main className="flex-1 py-6 pb-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-surface-dark py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} LearnTrack. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <a href="/about" className="hover:text-gray-900 dark:hover:text-white">About</a>
              <a href="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
              <a href="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
              <a href="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#1e293b',
            borderRadius: 8,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;