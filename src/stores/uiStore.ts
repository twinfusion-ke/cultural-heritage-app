/**
 * UI State Store (Zustand)
 *
 * Manages transient UI state: online/offline banner,
 * sync status, and pending item count.
 */

import { create } from 'zustand';

interface UIState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: true,
  isSyncing: false,
  pendingSyncCount: 0,

  setOnline: (online) => set({ isOnline: online }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
}));
