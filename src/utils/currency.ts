/**
 * Currency formatting
 *
 * formatPrice is a plain function.
 * Components must also call useCurrencyCode() to re-render on change.
 */

import { useUIStore } from '../stores/uiStore';

const RATES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1 },
  KES: { symbol: 'KSh', rate: 129 },
  TZS: { symbol: 'TSh', rate: 2650 },
};

/** Call this in any component that shows prices — triggers re-render on currency change */
export function useCurrencyCode(): string {
  return useUIStore((s) => s.currency);
}

/** Format a USD price into the active currency */
export function formatPrice(usdValue: string | number): string {
  const code = useUIStore.getState().currency || 'USD';
  const cur = RATES[code] || RATES.USD;
  const num = typeof usdValue === 'string' ? parseFloat(usdValue.replace(/[^0-9.]/g, '')) : usdValue;
  if (isNaN(num) || num === 0) return `${cur.symbol}0`;
  const val = num * cur.rate;
  if (code === 'USD') return `$${val.toFixed(2)}`;
  return `${cur.symbol} ${Math.round(val).toLocaleString('en')}`;
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'KES', symbol: 'KSh', label: 'Kenya Shilling' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzania Shilling' },
];
