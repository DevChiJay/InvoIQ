import { formatDistanceToNow } from 'date-fns';

/**
 * Safely formats a date string to a relative time (e.g., "2 days ago")
 * Returns "N/A" if the date is invalid or missing
 */
export const formatRelativeDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'N/A';
  }
};

/**
 * Safely formats a date string to a localized date string
 * Returns "N/A" if the date is invalid or missing
 */
export const formatSimpleDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

/**
 * Safely formats a date string to ISO format (YYYY-MM-DD)
 * Returns empty string if the date is invalid or missing
 */
export const formatISODate = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Formats a currency value
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get badge variant for invoice status
 */
export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid':
      return 'default'; // Green
    case 'sent':
      return 'secondary'; // Blue
    case 'overdue':
      return 'destructive'; // Red
    case 'draft':
      return 'outline'; // Gray
    default:
      return 'outline';
  }
};

/**
 * Get display text for invoice status
 */
export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};
