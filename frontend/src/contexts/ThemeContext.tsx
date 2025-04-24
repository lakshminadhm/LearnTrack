import React, { createContext, useContext, useEffect, useState } from 'react';

// Define theme colors
type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
};

// Define theme elevation (shadows)
type ThemeElevation = {
  small: string;
  medium: string;
  large: string;
};

// Define theme spacing
type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

// Define theme radius
type ThemeRadius = {
  sm: string;
  md: string;
  lg: string;
  full: string;
};

// Define theme transition
type ThemeTransition = {
  fast: string;
  normal: string;
  slow: string;
};

// Define complete theme type
export type ThemeObject = {
  colors: ThemeColors;
  elevation: ThemeElevation;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  transition: ThemeTransition;
};

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Light theme configuration
const lightTheme: ThemeObject = {
  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#6366f1', // indigo-500
    accent: '#8b5cf6', // violet-500
    background: '#f9fafb', // gray-50
    surface: '#ffffff',
    text: '#1e293b', // slate-800
    textSecondary: '#64748b', // slate-500
    border: '#e2e8f0', // slate-200
    error: '#ef4444', // red-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    info: '#06b6d4', // cyan-500
  },
  elevation: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Dark theme configuration
const darkTheme: ThemeObject = {
  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#818cf8', // indigo-400
    accent: '#a78bfa', // violet-400
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    text: '#f1f5f9', // slate-100
    textSecondary: '#94a3b8', // slate-400
    border: '#334155', // slate-700
    error: '#f87171', // red-400
    success: '#34d399', // emerald-400
    warning: '#fbbf24', // amber-400
    info: '#22d3ee', // cyan-400
  },
  elevation: {
    small: '0 1px 3px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.12)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.10)',
  },
  spacing: lightTheme.spacing,
  radius: lightTheme.radius,
  transition: lightTheme.transition,
};

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: ThemeObject;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('themeMode');
    return (stored as ThemeMode) || 'system';
  });
  
  const [theme, setTheme] = useState<ThemeObject>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Effect to handle theme changes and system preference
  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine if we should use dark mode
    const shouldUseDark = mode === 'system' ? systemDark : mode === 'dark';
    setIsDark(shouldUseDark);
    
    // Apply the appropriate theme object
    setTheme(shouldUseDark ? darkTheme : lightTheme);
    
    // Update the DOM
    root.classList.remove('light', 'dark');
    root.classList.add(shouldUseDark ? 'dark' : 'light');
    
    // Store the preference
    localStorage.setItem('themeMode', mode);
    
    // Add event listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mode === 'system') {
        const newSystemDark = mediaQuery.matches;
        setIsDark(newSystemDark);
        setTheme(newSystemDark ? darkTheme : lightTheme);
        root.classList.remove('light', 'dark');
        root.classList.add(newSystemDark ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
