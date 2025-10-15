import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-primary text-primary-foreground shadow-glow-sm hover:shadow-glow hover:scale-[1.02]':
              variant === 'default',
            'bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-card hover:shadow-card-hover hover:scale-[1.02]':
              variant === 'destructive',
            'border-2 border-border bg-card hover:bg-muted hover:border-primary/50 hover:scale-[1.02] shadow-sm':
              variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md':
              variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 hover:underline': variant === 'link',
            'bg-gradient-success text-success-foreground shadow-glow-sm hover:shadow-glow hover:scale-[1.02]':
              variant === 'success',
            'bg-gradient-to-r from-warning to-orange-500 text-warning-foreground shadow-glow-sm hover:shadow-glow hover:scale-[1.02]':
              variant === 'warning',
          },
          {
            'h-10 px-5 py-2': size === 'default',
            'h-9 rounded-md px-3 text-xs': size === 'sm',
            'h-11 rounded-lg px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
