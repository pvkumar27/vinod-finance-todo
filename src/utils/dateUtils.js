/**
 * Date utilities for consistent date handling
 * Using date-fns library for reliable date operations
 */
import { format, parseISO } from 'date-fns';

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Formats a date string to MM/dd display format
 * Handles both YYYY-MM-DD and ISO format dates
 */
export function formatDateString(dateStr) {
  if (!dateStr) return '';
  
  try {
    // Get just the date part (YYYY-MM-DD)
    const datePart = dateStr.split('T')[0];
    
    // Parse the date using date-fns
    const date = parseISO(datePart);
    
    // Format as MM/dd
    return format(date, 'MM/dd');
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}