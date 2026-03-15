/**
 * Environment Store (Zustand + MMKV)
 *
 * Manages active environment and API URLs.
 * Persisted to survive app restarts.
 */

import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import {
  ENVIRONMENTS,
  DEFAULT_ENV,
  getApiUrls,
  type Environment,
  type ApiUrls,
} from '../config/environment';

const storage = new MMKV({ id: 'env-store' });

interface EnvState {
  activeEnvKey: string;
  env: Environment;
  urls: ApiUrls;
  setEnvironment: (key: string) => void;
  updateCredentials: (creds: Partial<Pick<Environment, 'wcConsumerKey' | 'wcConsumerSecret' | 'posApiKey'>>) => void;
}

// Load persisted env or default
function getInitialEnv(): { key: string; env: Environment } {
  const savedKey = storage.getString('activeEnvKey') || DEFAULT_ENV;
  const savedCreds = storage.getString('envCredentials');
  const env = { ...ENVIRONMENTS[savedKey] };

  if (savedCreds) {
    try {
      const creds = JSON.parse(savedCreds);
      Object.assign(env, creds);
    } catch {}
  }

  return { key: savedKey, env };
}

const initial = getInitialEnv();

export const useEnvStore = create<EnvState>((set, get) => ({
  activeEnvKey: initial.key,
  env: initial.env,
  urls: getApiUrls(initial.env.baseDomain),

  setEnvironment: (key: string) => {
    const env = { ...ENVIRONMENTS[key] };
    if (!env) return;

    storage.set('activeEnvKey', key);

    set({
      activeEnvKey: key,
      env,
      urls: getApiUrls(env.baseDomain),
    });
  },

  updateCredentials: (creds) => {
    const current = get().env;
    const updated = { ...current, ...creds };

    storage.set('envCredentials', JSON.stringify({
      wcConsumerKey: updated.wcConsumerKey,
      wcConsumerSecret: updated.wcConsumerSecret,
      posApiKey: updated.posApiKey,
    }));

    set({
      env: updated,
      urls: getApiUrls(updated.baseDomain),
    });
  },
}));
