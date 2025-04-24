import React from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = 
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", rounded = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors";
    
    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
      lg: "px-3 py-1 text-base",
    };
    
    const variantStyles = {
      default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
      secondary: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300",
      accent: "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300",
      success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      outline: "bg-transparent border border-gray-300 text-gray-800 dark:border-gray-600 dark:text-gray-300",
    };
    
    const roundedStyles = rounded ? "rounded-full" : "rounded";
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          roundedStyles,
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";