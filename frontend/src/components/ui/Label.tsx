/**
 * Label component
 *
 * Reusable form label component with consistent styling.
 * Follows the application's dark theme design system.
 *
 * @module components/ui/Label
 */

import { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required (adds asterisk) */
  required?: boolean;
}

/**
 * Styled label component for forms
 *
 * Features:
 * - Consistent dark theme styling
 * - Optional required indicator (*)
 * - Proper accessibility with htmlFor
 * - Supports all native label props
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email
 * </Label>
 * <Input id="email" type="email" />
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  children,
  required,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`block text-sm font-medium text-foreground mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
};
