/**
 * Currency formatting utility
 *
 * NOT a hook — a plain function that reads from the store.
 * Safe to call anywhere without hook rules.
 */

import { useUIStore } from '../stores/uiStore';

const RATES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  KES: { symbol: 'KSh', rate: 129 },
  TZS: { symbol: 'TSh', rate: 2650 },
};

/** Format a USD price string into the active currency */
export function formatPrice(usdValue: string | number): string {
  const code = useUIStore.getState().currency || 'USD';
  const cur = RATES[code] || RATES.USD;
  const num = typeof usdValue === 'string' ? parseFloat(usdValue.replace(/[^0-9.]/g, '')) : usdValue;
  if (isNaN(num) || num === 0) return `${cur.symbol}0`;
  const val = num * cur.rate;
  if (code === 'USD') return `$${val.toFixed(2)}`;
  return `${cur.symbol} ${Math.round(val).toLocaleString('en')}`;
}

/** Get list of available currencies */
export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'KES', symbol: 'KSh', label: 'Kenya Shilling' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzania Shilling' },
];
