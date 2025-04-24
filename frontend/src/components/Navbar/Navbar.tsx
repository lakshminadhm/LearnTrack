import React, { useEffect } from 'react';
import { X, Home, BookOpen, Target, LineChart, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { Logo } from '../ui/Logo';

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
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { mode, setMode, isDark } = useTheme();

  const navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Goals', path: '/goals', icon: <Target className="w-5 h-5" /> },
    { label: 'Learning Logs', path: '/logs', icon: <LineChart className="w-5 h-5" /> },
    { label: 'Community', path: '/community', icon: <MessageSquare className="w-5 h-5" /> },
    // { label: 'Admin Dashboard', path: '/admin', icon: <Settings className="w-5 h-5" />, admin: true },
  ];

  const adminNavigation = [
    { label: 'Admin Dashboard', path: '/admin', icon: <Settings className="w-5 h-5" /> },
    // { label: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ]
  const unAuthenticatedNavigation = [
    { label: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Login', path: '/login', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Register', path: '/register', icon: <Target className="w-5 h-5" /> },
  ];
  
  const fullNavigation = !isAuthenticated ? unAuthenticatedNavigation : isAdmin ? [...navigation, ...adminNavigation] : navigation;


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
      <div className="hidden lg:flex group flex-col fixed inset-y-0 z-50 w-16 hover:w-64 transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-background">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Logo labelVisibility="hover" />
        </div>

        <div className="flex-1 flex flex-col justify-between py-4">
          <Navigation items={fullNavigation} labelVisibility="hover" />
          <UserMenu
              user={user}
              isDark={isDark}
              labelVisibility="hover"
              onToggleTheme={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              onLogout={logout}
            />
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
        "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-normal ease-in-out md:hidden",
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
          <Logo labelVisibility="hover"  />
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <Navigation items={fullNavigation} labelVisibility="always" />
          {user && (
            <UserMenu
              user={user}
              isDark={isDark}
              labelVisibility="always"
              onToggleTheme={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              onLogout={logout}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;