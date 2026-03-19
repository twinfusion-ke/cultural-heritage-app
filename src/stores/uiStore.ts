/**
 * UI State Store (Zustand)
 *
 * Manages transient UI state: online/offline banner,
 * sync status, and pending item count.
 */

import { create } from 'zustand';

interface RecentProduct {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  site: string;
}

interface UIState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  currency: string;
  recentlyViewed: RecentProduct[];
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setCurrency: (code: string) => void;
  addRecentlyViewed: (product: RecentProduct) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,
  currency: 'USD',
  recentlyViewed: [],

  setOnline: (online) => set({ isOnline: online }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setCurrency: (currency) => set({ currency }),
  addRecentlyViewed: (product) => {
    const current = get().recentlyViewed.filter((p) => !(p.id === product.id && p.site === product.site));
    set({ recentlyViewed: [product, ...current].slice(0, 10) });
  },
}));
