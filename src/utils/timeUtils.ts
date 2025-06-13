import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a date as a relative time string (e.g., "2 minutes ago")
 * @param date The date to format
 * @returns A string representing the relative time
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
}
