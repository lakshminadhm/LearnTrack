import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ThemeToggleProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  variant = 'dropdown' 
}) => {
  const { mode, setMode, isDark } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-theme-dropdown]')) {
          closeDropdown();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // For the buttons variant
  if (variant === 'buttons') {
    return (
      <div className={cn("flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden", className)}>
        <button
          type="button"
          onClick={() => setMode('light')}
          className={cn(
            "p-2 transition-colors",
            mode === 'light' 
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          aria-label="Light mode"
        >
          <Sun size={18} />
        </button>
        <button
          type="button"
          onClick={() => setMode('dark')}
          className={cn(
            "p-2 transition-colors",
            mode === 'dark' 
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          aria-label="Dark mode"
        >
          <Moon size={18} />
        </button>
        <button
          type="button"
          onClick={() => setMode('system')}
          className={cn(
            "p-2 transition-colors",
            mode === 'system' 
              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          aria-label="System preference"
        >
          <Monitor size={18} />
        </button>
      </div>
    );
  }
  
  // Default dropdown variant
  return (
    <div className={cn("relative", className)} data-theme-dropdown>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 p-0 rounded-full flex items-center justify-center"
        onClick={toggleOpen}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Moon size={18} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun size={18} className="text-amber-500" />
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-elevation-medium dark:shadow-elevation-medium-dark border border-gray-200 dark:border-gray-700 z-10 animate-slide-down">
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              setMode('light');
              closeDropdown();
            }}
          >
            <Sun size={16} className="mr-2 text-amber-500" />
            Light Mode
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              setMode('dark');
              closeDropdown();
            }}
          >
            <Moon size={16} className="mr-2 text-blue-400" />
            Dark Mode
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              setMode('system');
              closeDropdown();
            }}
          >
            <Monitor size={16} className="mr-2 text-gray-500" />
            System Preference
          </button>
        </div>
      )}
    </div>
  );
};