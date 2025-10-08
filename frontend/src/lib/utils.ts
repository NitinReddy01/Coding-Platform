/**
 * Utility functions for the application
 *
 * @module lib/utils
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper conflict resolution
 *
 * Combines clsx for conditional classes and tailwind-merge to handle
 * Tailwind class conflicts (e.g., 'px-2 px-4' → 'px-4').
 *
 * @param inputs - Class names to merge (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```typescript
 * cn('px-2 py-1', 'px-4') // → 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500') // → conditional application
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats execution time for display
 *
 * @param ms - Time in milliseconds
 * @returns Formatted string (e.g., "150ms" or "2.50s")
 *
 * @example
 * ```typescript
 * formatTime(150) // → "150ms"
 * formatTime(2500) // → "2.50s"
 * ```
 */
export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Formats memory usage for display
 *
 * @param mb - Memory in megabytes
 * @returns Formatted string (e.g., "512.00KB" or "1.50MB")
 *
 * @example
 * ```typescript
 * formatMemory(0.5) // → "512.00KB"
 * formatMemory(1.5) // → "1.50MB"
 * ```
 */
export function formatMemory(mb: number): string {
  if (mb < 1) return `${(mb * 1024).toFixed(2)}KB`;
  return `${mb.toFixed(2)}MB`;
}
