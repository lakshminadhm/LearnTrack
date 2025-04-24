import React from 'react';
import { cn } from '../../utils/cn';
import { LabelVisibility } from '../../../../shared/src/types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  labelVisibility: LabelVisibility;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  labelVisibility,
  className
}) => (
  <div className={cn("flex items-center w-full", className)}>
    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
      {icon}
    </div>
    <span className={cn(
      "ml-3 truncate",
      labelVisibility === 'hover' && "lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
      labelVisibility === 'never' && "hidden"
    )}>
      {label}
    </span>
  </div>
);

export default NavItem;