import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { 
  Table, TableHeader, TableBody, TableFooter, 
  TableHead, TableRow, TableCell 
} from './Table';
import { Button } from './Button';
import { Select } from './Select';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  className
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to show maxPagesToShow - 2 pages (accounting for first and last)
      if (endPage - startPage < maxPagesToShow - 3) {
        if (startPage === 2) {
          endPage = Math.min(totalPages - 1, startPage + (maxPagesToShow - 3));
        } else if (endPage === totalPages - 1) {
          startPage = Math.max(2, endPage - (maxPagesToShow - 3));
        }
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-center gap-y-4 pt-4", className)}>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{totalItems > 0 ? startItem : 0}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-x-2">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-x-2">
            <Select
              options={pageSizeOptions.map(size => ({ 
                value: size.toString(), 
                label: size.toString()
              }))}
              value={pageSize.toString()}
              onChange={handlePageSizeChange}
              className="!w-20"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>
        )}
        
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="rounded-r-none"
            aria-label="Go to first page"
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-none border-l-0"
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="hidden sm:flex mx-1">
            {getPageNumbers().map((page, index) => 
              page === '...' ? (
                <span 
                  key={`ellipsis-${index}`} 
                  className="flex items-center justify-center h-8 w-8 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(Number(page))}
                  className={cn(
                    "flex items-center justify-center h-8 w-8 text-sm rounded",
                    currentPage === page 
                      ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  {page}
                </button>
              )
            )}
          </div>
          
          <span className="sm:hidden text-sm px-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-none border-r-0"
            aria-label="Go to next page"
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="rounded-l-none"
            aria-label="Go to last page"
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: React.ReactNode;
    cell: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  initialSortKey?: string;
  initialSortDir?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  className?: string;
  tableClassName?: string;
  tableVariant?: 'default' | 'striped' | 'bordered';
  tableSize?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  initialSortKey,
  initialSortDir = 'asc',
  onRowClick,
  className,
  tableClassName,
  tableVariant = 'striped',
  tableSize = 'md',
  isLoading = false,
  emptyState
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir);
  
  // Reset to first page when pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);
  
  // Sort and paginate data
  const sortedData = React.useMemo(() => {
    let processed = [...data];
    
    // Sort data if a sort key is provided
    if (sortKey) {
      processed.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortDir === 'asc' ? -1 : 1;
        if (bValue == null) return sortDir === 'asc' ? 1 : -1;
        
        // String comparison for string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDir === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // Numeric comparison for numbers
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }
    
    return processed;
  }, [data, sortKey, sortDir]);
  
  // Calculate pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Get current page data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Handle sort click
  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Toggle direction if already sorting by this key
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to ascending
      setSortKey(key);
      setSortDir('asc');
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
          <table className={cn(
            "w-full text-sm text-left text-gray-700 dark:text-gray-300",
            tableClassName
          )}>
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-semibold">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="animate-pulse">
              {Array(pageSize).fill(0).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={1}
          totalPages={1}
          pageSize={pageSize}
          totalItems={0}
          onPageChange={() => {}}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      </div>
    );
  }
  
  // Render empty state
  if (data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 py-12">
          {emptyState || (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </div>
        <Pagination
          currentPage={1}
          totalPages={1}
          pageSize={pageSize}
          totalItems={0}
          onPageChange={() => {}}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      </div>
    );
  }
  
  // Render table with data
  return (
    <div className={cn("space-y-4", className)}>
      <Table 
        variant={tableVariant} 
        size={tableSize}
        className={tableClassName}
      >
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={cn(
                  column.sortable && "cursor-pointer select-none",
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="text-gray-500">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, i) => (
            <TableRow 
              key={i}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}