import { Search, FileQuestion, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'error';
  className?: string;
}

const iconMap = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const Icon = icon || iconMap[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        {typeof Icon === 'function' ? (
          <Icon className="w-8 h-8 text-muted-text" />
        ) : (
          Icon
        )}
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-text max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

// Predefined empty states
export function NoResults() {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search or filter criteria"
    />
  );
}

export function NoData({ message = 'No data available' }: { message?: string }) {
  return (
    <EmptyState
      icon={<FileQuestion className="w-8 h-8 text-muted-text" />}
      title={message}
      description="Check back later for updates"
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        )
      }
    />
  );
}
