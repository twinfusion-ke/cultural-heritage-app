/**
 * Cart Store (Zustand + MMKV)
 *
 * Unified cart across Market, Vault, and Gallery.
 * Persisted locally — survives app kill.
 */

import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import type { SiteKey } from '../config/environment';

const storage = new MMKV({ id: 'cart-store' });

export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string;
  site: SiteKey;
  attributes?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, site: SiteKey) => void;
  updateQuantity: (productId: number, site: SiteKey, quantity: number) => void;
  clearCart: () => void;
  clearSiteCart: (site: SiteKey) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getSiteItems: (site: SiteKey) => CartItem[];
}

// Load persisted cart
function loadCart(): CartItem[] {
  const saved = storage.getString('cart');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return [];
}

function persistCart(items: CartItem[]) {
  storage.set('cart', JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.site === item.site
      );
      let updated: CartItem[];
      if (existing) {
        updated = state.items.map((i) =>
          i.productId === item.productId && i.site === item.site
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...state.items, { ...item, quantity: 1 }];
      }
      persistCart(updated);
      return { items: updated };
    });
  },

  removeItem: (productId, site) => {
    set((state) => {
      const updated = state.items.filter(
        (i) => !(i.productId === productId && i.site === site)
      );
      persistCart(updated);
      return { items: updated };
    });
  },

  updateQuantity: (productId, site, quantity) => {
    set((state) => {
      const updated = quantity <= 0
        ? state.items.filter((i) => !(i.productId === productId && i.site === site))
        : state.items.map((i) =>
            i.productId === productId && i.site === site
              ? { ...i, quantity }
              : i
          );
      persistCart(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [] });
  },

  clearSiteCart: (site) => {
    set((state) => {
      const updated = state.items.filter((i) => i.site !== site);
      persistCart(updated);
      return { items: updated };
    });
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + parseFloat(item.price || '0') * item.quantity,
      0
    );
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSiteItems: (site) => {
    return get().items.filter((i) => i.site === site);
  },
}));
