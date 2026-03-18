/**
 * Market API — Products & Posts
 *
 * Fetches handcraft products and blog posts from The Market sub-site.
 * All data cached to SQLite for offline browsing.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { WCProduct, WCCategory } from '../types/woocommerce';
import type { WPPost } from '../types/wordpress';

function useMarketUrls() {
  return useEnvStore((s) => s.urls.market);
}

function useWcAuth() {
  const env = useEnvStore((s) => s.env);
  return env.wcConsumerKey
    ? { consumer_key: env.wcConsumerKey, consumer_secret: env.wcConsumerSecret }
    : {};
}

/** Fetch Market products with optional filters */
export function useMarketProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  orderby?: string;
  order?: string;
}) {
  const urls = useMarketUrls();
  const auth = useWcAuth();
  const cacheParams = JSON.stringify(params || {});

  return useQuery<WCProduct[]>({
    queryKey: ['market', 'products', params],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.wc}/products`, {
          params: {
            per_page: params?.perPage || 12,
            page: params?.page || 1,
            category: params?.category,
            search: params?.search,
            min_price: params?.minPrice,
            max_price: params?.maxPrice,
            orderby: params?.orderby || 'date',
            order: params?.order || 'desc',
            status: 'publish',
            ...auth,
          },
        });
        await cacheSet('market', 'products', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCProduct[]>('market', 'products', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Market product categories */
export function useMarketCategories() {
  const urls = useMarketUrls();
  const auth = useWcAuth();

  return useQuery<WCCategory[]>({
    queryKey: ['market', 'categories'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.wc}/products/categories`, {
          params: { per_page: 50, ...auth },
        });
        await cacheSet('market', 'categories', data);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCCategory[]>('market', 'categories');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

/** Fetch a single Market product */
export function useMarketProduct(id: number) {
  const urls = useMarketUrls();
  const auth = useWcAuth();

  return useQuery<WCProduct>({
    queryKey: ['market', 'product', id],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.wc}/products/${id}`, {
          params: auth,
        });
        await cacheSet('market', 'products', data, `id-${id}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCProduct>('market', 'products', `id-${id}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!id,
  });
}

/** Fetch Market blog posts */
export function useMarketPosts(perPage: number = 10) {
  const urls = useMarketUrls();

  return useQuery<WPPost[]>({
    queryKey: ['market', 'posts', perPage],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.rest}/posts`, {
          params: { per_page: perPage, _embed: true },
        });
        await cacheSet('market', 'posts', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WPPost[]>('market', 'posts', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
