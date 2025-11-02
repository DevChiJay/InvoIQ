/**
 * Currency configuration and utilities
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

/**
 * Supported currencies
 */
export const CURRENCIES: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', locale: 'en-GH' },
];

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'NGN';

/**
 * Get currency by code
 */
export const getCurrency = (code: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === code);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (code: string): string => {
  const currency = getCurrency(code);
  return currency?.symbol || code;
};
