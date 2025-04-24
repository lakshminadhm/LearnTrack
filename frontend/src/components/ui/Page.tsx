import React from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6",
      className
    )}>
      <div>
        {typeof title === 'string' ? (
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
        ) : (
          title
        )}
        {description && (
          <div className="mt-1 text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap gap-2 justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

interface PageSectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  actions,
  children,
  className
}) => {
  return (
    <section className={cn("mt-8 first:mt-0", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            {title && typeof title === 'string' ? (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            ) : (
              title
            )}
            {description && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </div>
            )}
          </div>
          {actions && (
            <div className="flex flex-shrink-0 gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};

interface PageProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in' | 'slide-up' | 'none';
}

export const Page: React.FC<PageProps> = ({
  children,
  className,
  animation = 'fade-in'
}) => {
  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'none': ''
  };
  
  return (
    <div className={cn("space-y-6", animationClass[animation], className)}>
      {children}
    </div>
  );
};