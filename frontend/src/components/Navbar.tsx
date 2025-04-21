import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, BarChart2, ClipboardList, Target, Users, LogOut, LogIn, UserPlus, GraduationCap, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

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
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 font-bold text-xl">
              LearnTrack
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                (!link.auth || isAuthenticated) && (!link.adminOnly || isAdmin) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-700 ${
                      location.pathname === link.path
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Link>
                )
              ))}
              
              {authLinks.map((link, i) => (
                link.show && (
                  link.action ? (
                    <button
                      key={`auth-${i}`}
                      onClick={link.action}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      key={`auth-${i}`}
                      to={link.path!}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-700 ${
                        location.pathname === link.path
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </Link>
                  )
                )
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            (!link.auth || isAuthenticated) && (!link.adminOnly || isAdmin) && (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={closeMenu}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            )
          ))}
          
          {authLinks.map((link, i) => (
            link.show && (
              link.action ? (
                <button
                  key={`auth-${i}`}
                  onClick={link.action}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </button>
              ) : (
                <Link
                  key={`auth-${i}`}
                  to={link.path!}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={closeMenu}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              )
            )
          ))}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);