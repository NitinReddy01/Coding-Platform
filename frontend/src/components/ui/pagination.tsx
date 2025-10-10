import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

    // Add ellipsis after first page if needed
    if (leftSibling > 2) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rightSibling < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={!canGoPrevious}
        className={cn(
          'p-2 rounded-md transition-colors',
          canGoPrevious
            ? 'hover:bg-muted text-text'
            : 'text-muted-text cursor-not-allowed opacity-50'
        )}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className={cn(
          'p-2 rounded-md transition-colors',
          canGoPrevious
            ? 'hover:bg-muted text-text'
            : 'text-muted-text cursor-not-allowed opacity-50'
        )}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-muted-text"
              >
                ...
              </span>
            );
          }

          const page = pageNum as number;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px] px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-muted text-text'
              )}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={cn(
          'p-2 rounded-md transition-colors',
          canGoNext
            ? 'hover:bg-muted text-text'
            : 'text-muted-text cursor-not-allowed opacity-50'
        )}
        aria-label="Go to next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={!canGoNext}
        className={cn(
          'p-2 rounded-md transition-colors',
          canGoNext
            ? 'hover:bg-muted text-text'
            : 'text-muted-text cursor-not-allowed opacity-50'
        )}
        aria-label="Go to last page"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

// Simple pagination info text
interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className,
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className={cn('text-sm text-muted-text', className)}>
      Showing <span className="font-medium text-text">{start}</span> to{' '}
      <span className="font-medium text-text">{end}</span> of{' '}
      <span className="font-medium text-text">{totalItems}</span> results
    </p>
  );
}
