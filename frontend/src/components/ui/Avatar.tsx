import React from "react";
import { cn } from "../../utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy" | "none";
  shape?: "circle" | "square";
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    src, 
    alt = "Avatar", 
    fallback, 
    size = "md", 
    status = "none", 
    shape = "circle",
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    
    const sizeStyles = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
    };
    
    const shapeStyles = {
      circle: "rounded-full",
      square: "rounded-md",
    };
    
    const statusColors = {
      online: "bg-green-500",
      offline: "bg-gray-500",
      away: "bg-yellow-500",
      busy: "bg-red-500",
      none: "",
    };
    
    const getFallbackText = () => {
      if (fallback) return fallback;
      if (!alt) return "";
      
      // Get initials from alt text (usually the user's name)
      return alt
        .split(" ")
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex overflow-hidden bg-gray-200 dark:bg-gray-700",
          sizeStyles[size],
          shapeStyles[shape],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center rounded-full justify-center font-medium text-gray-700 dark:text-gray-300">
            {getFallbackText()}
          </div>
        )}
        
        {status !== "none" && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900",
              statusColors[status],
              {
                "h-1.5 w-1.5": size === "xs",
                "h-2 w-2": size === "sm",
                "h-2.5 w-2.5": size === "md",
                "h-3 w-3": size === "lg",
                "h-3.5 w-3.5": size === "xl",
              }
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";