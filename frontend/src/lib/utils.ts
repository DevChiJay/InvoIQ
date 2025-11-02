import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats API error detail into a user-friendly string message.
 * Handles FastAPI validation errors which return detail as an array of objects.
 */
export function formatErrorMessage(detail: unknown, fallback: string): string {
  // If detail is a string, return it
  if (typeof detail === 'string') {
    return detail;
  }
  
  // If detail is an array (FastAPI validation errors)
  if (Array.isArray(detail)) {
    // Extract messages from validation error objects
    const messages = detail
      .map((err: unknown) => {
        if (typeof err === 'string') return err;
        if (err && typeof err === 'object' && 'msg' in err) {
          return String(err.msg);
        }
        return null;
      })
      .filter(Boolean);
    
    return messages.length > 0 ? messages.join(', ') : fallback;
  }
  
  // If detail is an object with a message property
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as Record<string, unknown>).msg);
  }
  
  // Fallback to default message
  return fallback;
}
