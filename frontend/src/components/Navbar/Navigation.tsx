import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import NavItem from './NavItem';
import { LabelVisibility } from '../../../../shared/src/types';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  admin?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  labelVisibility: LabelVisibility;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  items, 
  labelVisibility = 'always' 
}) => {
  const location = useLocation();

  return (
    <nav className="flex-1 px-3 space-y-1">
      {items.map(item => (
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
          <NavItem 
            icon={item.icon}
            label={item.label}
            isActive={location.pathname.startsWith(item.path)}
            labelVisibility={labelVisibility}
          />
        </Link>
      ))}
    </nav>
  );
};