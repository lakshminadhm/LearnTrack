import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-10 md:px-8 md:py-14">
        {children}
      </main>
      <footer className="bg-gray-900/90 text-gray-300 dark:bg-gray-950 dark:text-gray-400 py-8 border-t border-gray-800">
        <div className="w-full max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-sm">&copy; {new Date().getFullYear()} LearnTrack. All rights reserved.</p>
          <div className="flex space-x-4 text-xs opacity-70">
            <a href="/" className="hover:underline">Home</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#23272f',
            color: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
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