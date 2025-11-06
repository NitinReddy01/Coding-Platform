/**
 * Textarea component
 *
 * Reusable form textarea component with consistent styling and error states.
 * Follows the application's dark theme design system.
 *
 * @module components/ui/Textarea
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea has an error (applies error styling) */
  error?: boolean;
}

/**
 * Styled textarea component for forms
 *
 * Features:
 * - Consistent dark theme styling
 * - Focus states with primary color
 * - Error state styling
 * - Full width by default
 * - Supports all native textarea props
 * - Ref forwarding for form libraries
 * - Auto-resize support via CSS
 *
 * @example
 * ```tsx
 * <Textarea
 *   placeholder="Enter description..."
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   error={!!errors.description}
 *   rows={5}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses =
      'w-full px-4 py-3 rounded-lg bg-card border transition-colors duration-200 text-foreground placeholder:text-muted-foreground focus:outline-none resize-y min-h-[100px]';

    const stateClasses = error
      ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20';

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
