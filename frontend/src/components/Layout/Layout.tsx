import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
// import Navbar from './Navbar';
import Navbar from '../Navbar/Navbar';
import Topbar from './Topbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background transition-colors duration-normal">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
      />
      <div className="flex flex-col flex-1 lg:pl-16">
        <Topbar
          setSidebarOpen={setSidebarOpen}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
        />

        <main className="flex-1 py-6 pb-12 px-4 md:px-6 lg:px-8 bg-background">
          {children}
        </main>

        <footer className="bg-white dark:bg-surface-dark py-4 border-t mt-auto">
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

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-card text-card-foreground border shadow-lg',
          success: {
            className: 'bg-green-50 border-green-100 text-green-800',
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            className: 'bg-red-50 border-red-100 text-red-800',
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
