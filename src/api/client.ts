/**
 * API Client Factory
 *
 * Creates typed Axios instances for each WP sub-site.
 * All instances derive URLs from the active environment.
 * Handles WooCommerce auth and POS API key injection.
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useEnvStore } from '../stores/envStore';

/** Create a base Axios instance with shared config */
function createInstance(baseURL: string, config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...config,
  });

  // Response interceptor: unwrap data
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response) {
        // Network error — let SyncQueue handle it
        return Promise.reject({ ...error, isNetworkError: true });
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

/** Get API clients using current environment URLs */
export function getApiClients() {
  const { urls, env } = useEnvStore.getState();

  // WooCommerce auth params
  const wcAuth = env.wcConsumerKey
    ? { consumer_key: env.wcConsumerKey, consumer_secret: env.wcConsumerSecret }
    : {};

  return {
    /** Main Hub — WordPress REST (posts, pages) */
    hub: createInstance(urls.hub.rest),

    /** Market — WordPress REST + WooCommerce */
    market: {
      rest: createInstance(urls.market.rest),
      wc: createInstance(urls.market.wc, { params: wcAuth }),
    },

    /** Jewelry — WordPress REST + WooCommerce */
    jewelry: {
      rest: createInstance(urls.jewelry.rest),
      wc: createInstance(urls.jewelry.wc, { params: wcAuth }),
    },

    /** Gallery — WordPress REST + WooCommerce + POS API */
    gallery: {
      rest: createInstance(urls.gallery.rest),
      wc: createInstance(urls.gallery.wc, { params: wcAuth }),
      pos: createInstance(urls.gallery.pos, {
        headers: { 'X-POS-API-Key': env.posApiKey },
      }),
    },
  };
}

export type ApiClients = ReturnType<typeof getApiClients>;
