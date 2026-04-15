/**
 * Environment Configuration
 *
 * Single source of truth for API base URLs.
 * The app now uses a custom PHP API that reads directly from the
 * WordPress database — no WooCommerce REST API keys required.
 */

export interface Environment {
  name: string;
  baseDomain: string;
  apiPath: string;
  wcConsumerKey: string;
  wcConsumerSecret: string;
  posApiKey: string;
}

export const ENVIRONMENTS: Record<string, Environment> = {
  production: {
    name: 'Production',
    baseDomain: 'culturalheritagetz.com',
    apiPath: '/app-api',
    wcConsumerKey: '',
    wcConsumerSecret: '',
    posApiKey: '',
  },
  staging: {
    name: 'Staging (twinfusion.co.ke)',
    baseDomain: 'twinfusion.co.ke/cultural-heritage',
    apiPath: '/app-api',
    wcConsumerKey: '',
    wcConsumerSecret: '',
    posApiKey: '',
  },
  local: {
    name: 'Local Dev',
    baseDomain: 'localhost/cultural-heritage-wp',
    apiPath: '/app-api',
    wcConsumerKey: '',
    wcConsumerSecret: '',
    posApiKey: '',
  },
};

export const DEFAULT_ENV = 'production';

/**
 * Derive all API base URLs from a single domain.
 */
export function getApiUrls(baseDomain: string, apiPath?: string) {
  const protocol = baseDomain.startsWith('localhost') ? 'http' : 'https';
  const base = `${protocol}://${baseDomain}`;
  const api = `${base}${apiPath || '/app-api'}`;

  return {
    /** Custom PHP API — single endpoint, no auth required */
    api,
    hub: {
      rest: `${base}/wp-json/wp/v2`,
      base: base,
    },
    market: {
      rest: `${base}/market/wp-json/wp/v2`,
      wc: `${base}/market/wp-json/wc/v3`,
      base: `${base}/market`,
    },
    jewelry: {
      rest: `${base}/jewelry/wp-json/wp/v2`,
      wc: `${base}/jewelry/wp-json/wc/v3`,
      base: `${base}/jewelry`,
    },
    gallery: {
      rest: `${base}/gallery/wp-json/wp/v2`,
      wc: `${base}/gallery/wp-json/wc/v3`,
      pos: `${base}/gallery/wp-json/ch-gallery/v1/pos`,
      base: `${base}/gallery`,
    },
  };
}

export type ApiUrls = ReturnType<typeof getApiUrls>;
export type SiteKey = 'hub' | 'market' | 'jewelry' | 'gallery';
