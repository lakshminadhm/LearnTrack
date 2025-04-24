import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', size = 'md', hover = true, ...props }, ref) => {
    const baseStyles = 'w-full text-sm text-left text-gray-700 dark:text-gray-300 border-collapse';
    
    const variantStyles = {
      default: '',
      striped: '[&>tbody>tr:nth-child(odd)]:bg-gray-50 dark:[&>tbody>tr:nth-child(odd)]:bg-gray-800/40',
      bordered: 'border border-gray-200 dark:border-gray-700 [&>*>tr>*]:border [&>*>tr>*]:border-gray-200 dark:[&>*>tr>*]:border-gray-700',
    };
    
    const sizeStyles = {
      sm: '[&>thead>tr>th]:px-2 [&>thead>tr>th]:py-2 [&>tbody>tr>td]:px-2 [&>tbody>tr>td]:py-1.5',
      md: '[&>thead>tr>th]:px-4 [&>thead>tr>th]:py-3 [&>tbody>tr>td]:px-4 [&>tbody>tr>td]:py-2.5',
      lg: '[&>thead>tr>th]:px-6 [&>thead>tr>th]:py-4 [&>tbody>tr>td]:px-6 [&>tbody>tr>td]:py-3.5',
    };
    
    const hoverStyles = hover ? '[&>tbody>tr]:hover:bg-gray-100 dark:[&>tbody>tr]:hover:bg-gray-800/60' : '';
    
    return (
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
        <table 
          ref={ref}
          className={cn(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            hoverStyles,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref}
    className={cn(
      'bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700',
      className
    )}
    {...props} 
  />
));

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody 
    ref={ref}
    className={cn(
      'divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/30',
      className
    )}
    {...props} 
  />
));

TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot 
    ref={ref}
    className={cn(
      'bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700',
      className
    )}
    {...props} 
  />
));

TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr 
    ref={ref}
    className={cn(
      'transition-colors',
      className
    )}
    {...props} 
  />
));

TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th 
    ref={ref}
    className={cn(
      'font-semibold text-left whitespace-nowrap',
      className
    )}
    {...props} 
  />
));

TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td 
    ref={ref}
    className={cn(
      'whitespace-nowrap',
      className
    )}
    {...props} 
  />
));

TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption 
    ref={ref}
    className={cn(
      'mt-4 text-sm text-gray-500 dark:text-gray-400',
      className
    )}
    {...props} 
  />
));

TableCaption.displayName = 'TableCaption';