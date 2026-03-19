/**
 * Compare Store — Product comparison (max 3)
 */

import { create } from 'zustand';
import type { AppProduct } from '../api/types';

interface CompareState {
  items: Array<{ product: AppProduct; site: string }>;
  add: (product: AppProduct, site: string) => boolean;
  remove: (id: number) => void;
  clear: () => void;
  isComparing: (id: number) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],

  add: (product, site) => {
    const current = get().items;
    if (current.length >= 3) return false;
    if (current.find((i) => i.product.id === product.id)) return false;
    set({ items: [...current, { product, site }] });
    return true;
  },

  remove: (id) => {
    set({ items: get().items.filter((i) => i.product.id !== id) });
  },

  clear: () => set({ items: [] }),

  isComparing: (id) => get().items.some((i) => i.product.id === id),
}));
