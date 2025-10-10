import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
}

// Full page spinner
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}

// Inline spinner with text
interface SpinnerWithTextProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SpinnerWithText({
  text = 'Loading...',
  size = 'md',
  className,
}: SpinnerWithTextProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Spinner size={size} />
      <span className="text-sm text-muted-text">{text}</span>
    </div>
  );
}
