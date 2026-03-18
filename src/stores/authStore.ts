/**
 * Auth Store — User sessions with persistence
 *
 * Manages login/register, session tokens, user preferences,
 * and browsing analytics.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { appApi } from '../api/appApi';

const AUTH_KEY = 'auth_session';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  preferences?: Record<string, any>;
  created_at?: string;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  loaded: boolean;

  loadFromStorage: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Record<string, any>) => Promise<void>;

  // Analytics
  trackEvent: (eventType: string, screen?: string, productId?: number, site?: string, metadata?: string) => void;
}

function getDeviceInfo(): string {
  return JSON.stringify({
    platform: Platform.OS,
    version: Platform.Version,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loaded: false,

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(AUTH_KEY);
      if (saved) {
        const { user, token } = JSON.parse(saved);
        // Verify session is still valid
        try {
          const res = await appApi<any>('profile', { token });
          if (res.user) {
            set({ user: res.user, token, loaded: true });
            return;
          }
        } catch {}
        // Session expired
        await AsyncStorage.removeItem(AUTH_KEY);
      }
      set({ loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  register: async (name, email, password, phone) => {
    try {
      const res = await appApi<any>('register', {
        name, email, password, phone,
        device_info: getDeviceInfo(),
      });
      if (res.error) return { success: false, error: res.error };

      const auth = { user: res.user, token: res.token };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      set({ user: res.user, token: res.token });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  login: async (email, password) => {
    try {
      const res = await appApi<any>('login', {
        email, password,
        device_info: getDeviceInfo(),
      });
      if (res.error) return { success: false, error: res.error };

      const auth = { user: res.user, token: res.token };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      set({ user: res.user, token: res.token });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  logout: async () => {
    const { token } = get();
    if (token) {
      try { await appApi('logout', { token }); } catch {}
    }
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ user: null, token: null });
  },

  updatePreferences: async (prefs) => {
    const { token, user } = get();
    if (!token || !user) return;
    const updated = { ...user.preferences, ...prefs };
    try {
      await appApi('profile', { token, preferences: JSON.stringify(updated) });
      set({ user: { ...user, preferences: updated } });
    } catch {}
  },

  trackEvent: (eventType, screen, productId, site, metadata) => {
    const { token } = get();
    // Fire and forget — don't await, don't block UI
    appApi('track', {
      token: token || '',
      event_type: eventType,
      screen,
      product_id: productId,
      site,
      metadata,
      device_info: getDeviceInfo(),
    }).catch(() => {});
  },
}));
