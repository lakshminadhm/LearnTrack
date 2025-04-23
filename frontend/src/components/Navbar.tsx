import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, BarChart2, ClipboardList, Target, Users, LogOut, LogIn, UserPlus, GraduationCap, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeMenu from './ThemeMenu';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const handleLogout = async () => { await logout(); closeMenu(); };

  const navLinks = [
    { path: '/', label: 'Home', icon: <BookOpen className="w-5 h-5" />, auth: false },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" />, auth: true },
    { path: '/logs', label: 'Logs', icon: <ClipboardList className="w-5 h-5" />, auth: true },
    { path: '/goals', label: 'Goals', icon: <Target className="w-5 h-5" />, auth: true },
    { path: '/courses', label: 'Courses', icon: <GraduationCap className="w-5 h-5" />, auth: true },
    { path: '/community', label: 'Community', icon: <Users className="w-5 h-5" />, auth: true },
    { path: '/admin', label: 'Admin', icon: <Settings className="w-5 h-5" />, auth: true, adminOnly: true },
  ];
  const authLinks = [
    { path: '/login', label: 'Login', icon: <LogIn className="w-5 h-5" />, show: !isAuthenticated },
    { path: '/register', label: 'Register', icon: <UserPlus className="w-5 h-5" />, show: !isAuthenticated },
    { action: handleLogout, label: 'Logout', icon: <LogOut className="w-5 h-5" />, show: isAuthenticated },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg transition-all border-b border-gray-200 dark:border-gray-800">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0 font-bold text-2xl tracking-tight text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <BookOpen className="w-7 h-7" />
            LearnTrack
          </Link>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              (!link.auth || isAuthenticated) && (!link.adminOnly || isAdmin) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800/70 ${location.pathname === link.path ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 shadow' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            {authLinks.map((link, i) => (
              link.show && (
                link.action ? (
                  <button
                    key={`auth-${i}`}
                    onClick={link.action}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800/70 transition-all duration-200"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </button>
                ) : (
                  <Link
                    key={`auth-${i}`}
                    to={link.path!}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800/70 ${location.pathname === link.path ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 shadow' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                )
              )
            ))}
            {/* Theme toggle */}
            <ThemeMenu theme={theme} setTheme={setTheme} />
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-300 dark:hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded={isOpen} onClick={toggleMenu}>
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 dark:bg-gray-900/95 shadow-lg rounded-b-xl border-b border-gray-200 dark:border-gray-800">
          {navLinks.map((link) => (
            (!link.auth || isAuthenticated) && (!link.adminOnly || isAdmin) && (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800/70 ${location.pathname === link.path ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 shadow' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={closeMenu}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          ))}
          {authLinks.map((link, i) => (
            link.show && (
              link.action ? (
                <button
                  key={`auth-${i}`}
                  onClick={link.action}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800/70 transition-all duration-200"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ) : (
                <Link
                  key={`auth-${i}`}
                  to={link.path!}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-gray-800/70 ${location.pathname === link.path ? 'bg-indigo-100 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 shadow' : 'text-gray-700 dark:text-gray-300'}`}
                  onClick={closeMenu}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              )
            )
          ))}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button aria-label="Light mode" className={`p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-800/70 transition-colors ${theme === 'light' ? 'bg-indigo-100 dark:bg-gray-800' : ''}`} onClick={() => setTheme('light')}><Sun className="w-5 h-5" /></button>
            <button aria-label="Dark mode" className={`p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-800/70 transition-colors ${theme === 'dark' ? 'bg-indigo-100 dark:bg-gray-800' : ''}`} onClick={() => setTheme('dark')}><Moon className="w-5 h-5" /></button>
            <button aria-label="System mode" className={`p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-800/70 transition-colors ${theme === 'system' ? 'bg-indigo-100 dark:bg-gray-800' : ''}`} onClick={() => setTheme('system')}><Monitor className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);