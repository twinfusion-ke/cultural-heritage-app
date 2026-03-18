/**
 * useFormatPrice — Currency formatting hook
 *
 * Standalone hook, no circular dependencies.
 */

import { useUIStore } from '../stores/uiStore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'KES', symbol: 'KSh', rate: 129 },
  { code: 'TZS', symbol: 'TSh', rate: 2650 },
];

export default function useFormatPrice() {
  const code = useUIStore((s) => s.currency);
  const cur = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

  return function (value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(num) || num === 0) return `${cur.symbol}0`;
    const converted = num * cur.rate;
    if (cur.code === 'USD') return `$${converted.toFixed(2)}`;
    return `${cur.symbol} ${Math.round(converted).toLocaleString('en')}`;
  };
}
