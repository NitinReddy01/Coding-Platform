/**
 * Input component
 *
 * Reusable form input component with consistent styling and error states.
 * Follows the application's dark theme design system.
 *
 * @module components/ui/Input
 */

import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input has an error (applies error styling) */
  error?: boolean;
}

/**
 * Styled input component for forms
 *
 * Features:
 * - Consistent dark theme styling
 * - Focus states with primary color
 * - Error state styling
 * - Full width by default
 * - Supports all native input props
 * - Ref forwarding for form libraries
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="Email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={!!errors.email}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses =
      'w-full px-4 py-3 rounded-lg bg-card border transition-colors duration-200 text-foreground placeholder:text-muted-foreground focus:outline-none';

    const stateClasses = error
      ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
