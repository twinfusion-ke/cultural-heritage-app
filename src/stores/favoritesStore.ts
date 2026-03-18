/**
 * Favorites Store (Zustand + AsyncStorage)
 *
 * Persists wishlist items locally.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = 'favorites';

export interface FavoriteItem {
  productId: number;
  name: string;
  price: string;
  imageUrl: string;
  site: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  loaded: boolean;
  loadFromStorage: () => Promise<void>;
  toggle: (item: FavoriteItem) => void;
  isFavorite: (productId: number, site: string) => boolean;
  clear: () => void;
}

function persist(items: FavoriteItem[]) {
  AsyncStorage.setItem(FAV_KEY, JSON.stringify(items));
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  loaded: false,

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(FAV_KEY);
      if (saved) set({ items: JSON.parse(saved), loaded: true });
      else set({ loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: (item) => {
    set((state) => {
      const exists = state.items.find(
        (i) => i.productId === item.productId && i.site === item.site
      );
      const updated = exists
        ? state.items.filter((i) => !(i.productId === item.productId && i.site === item.site))
        : [...state.items, item];
      persist(updated);
      return { items: updated };
    });
  },

  isFavorite: (productId, site) => {
    return get().items.some((i) => i.productId === productId && i.site === site);
  },

  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
