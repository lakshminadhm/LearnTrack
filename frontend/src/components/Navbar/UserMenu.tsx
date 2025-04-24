import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import NavItem from './NavItem';
import { LabelVisibility, User } from '../../../../shared/src/types';
import { cn } from '../../utils/cn';

interface UserMenuProps {
  user: User | null;
  isDark: boolean;
  labelVisibility: LabelVisibility;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isDark,
  labelVisibility = 'always',
  onToggleTheme,
  onLogout
}) => (
  <div className="px-3 space-y-2 border-t border-gray-200 dark:border-gray-600 pt-4">
    <button
      onClick={onToggleTheme}
      className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <NavItem
        icon={isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        label={isDark ? "Light Mode" : "Dark Mode"}
        labelVisibility={labelVisibility}
      />
    </button>
    {user && (
      <>
        <Link
          to="/profile"
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <Avatar
                size="sm"
                src={user.avatar_url}
                alt={user.display_name || user.email || "User"}
                status={user.is_online ? "online" : "offline"}
              />
            </div>
            <div className={cn(
              "ml-3",
              labelVisibility === 'hover' && "lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
              labelVisibility === 'never' && "hidden"
            )}>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.display_name || user.email || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role === 'admin' ? 'Administrator' : 'Learner'}
              </p>
            </div>
          </div>
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <NavItem
            icon={<LogOut className="w-5 h-5" />}
            label="Sign out"
            labelVisibility={labelVisibility}
          />
        </button>
      </>
    )}
  </div>
);