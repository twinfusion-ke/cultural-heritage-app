/**
 * Environment Store (Zustand + AsyncStorage)
 *
 * Manages active environment and API URLs.
 * Persisted to survive app restarts.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ENVIRONMENTS,
  DEFAULT_ENV,
  getApiUrls,
  type Environment,
  type ApiUrls,
} from '../config/environment';

interface EnvState {
  activeEnvKey: string;
  env: Environment;
  urls: ApiUrls;
  loaded: boolean;
  loadFromStorage: () => Promise<void>;
  setEnvironment: (key: string) => void;
  updateCredentials: (creds: Partial<Pick<Environment, 'wcConsumerKey' | 'wcConsumerSecret' | 'posApiKey'>>) => void;
}

export const useEnvStore = create<EnvState>((set, get) => ({
  activeEnvKey: DEFAULT_ENV,
  env: ENVIRONMENTS[DEFAULT_ENV],
  urls: getApiUrls(ENVIRONMENTS[DEFAULT_ENV].baseDomain, ENVIRONMENTS[DEFAULT_ENV].apiPath),
  loaded: false,

  loadFromStorage: async () => {
    try {
      const savedKey = await AsyncStorage.getItem('activeEnvKey') || DEFAULT_ENV;
      const savedCreds = await AsyncStorage.getItem('envCredentials');
      const env = { ...ENVIRONMENTS[savedKey] };

      if (savedCreds) {
        try { Object.assign(env, JSON.parse(savedCreds)); } catch {}
      }

      set({
        activeEnvKey: savedKey,
        env,
        urls: getApiUrls(env.baseDomain, env.apiPath),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  setEnvironment: (key: string) => {
    const env = { ...ENVIRONMENTS[key] };
    if (!env) return;

    AsyncStorage.setItem('activeEnvKey', key);

    set({
      activeEnvKey: key,
      env,
      urls: getApiUrls(env.baseDomain, env.apiPath),
    });
  },

  updateCredentials: (creds) => {
    const current = get().env;
    const updated = { ...current, ...creds };

    AsyncStorage.setItem('envCredentials', JSON.stringify({
      wcConsumerKey: updated.wcConsumerKey,
      wcConsumerSecret: updated.wcConsumerSecret,
      posApiKey: updated.posApiKey,
    }));

    set({
      env: updated,
      urls: getApiUrls(updated.baseDomain, updated.apiPath),
    });
  },
}));
