/**
 * Environment Configuration
 *
 * Single source of truth for API base URLs.
 * All 4 sub-site URLs derive from one BASE_DOMAIN.
 * Switchable at runtime without app rebuild.
 */

export interface Environment {
  name: string;
  baseDomain: string;
  wcConsumerKey: string;
  wcConsumerSecret: string;
  posApiKey: string;
}

export const ENVIRONMENTS: Record<string, Environment> = {
  production: {
    name: 'Production',
    baseDomain: 'twinfusion.co.ke/cultural-heritage',
    wcConsumerKey: '', // Set via admin settings
    wcConsumerSecret: '',
    posApiKey: '',
  },
  staging: {
    name: 'Staging',
    baseDomain: 'localhost/cultural-heritage-wp',
    wcConsumerKey: '',
    wcConsumerSecret: '',
    posApiKey: '',
  },
};

export const DEFAULT_ENV = 'production';

/**
 * Derive all API base URLs from a single domain.
 */
export function getApiUrls(baseDomain: string) {
  const protocol = baseDomain.startsWith('localhost') ? 'http' : 'https';
  const base = `${protocol}://${baseDomain}`;

  return {
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
