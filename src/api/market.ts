/**
 * Market API — Products & Posts
 *
 * Uses the custom PHP API. No WooCommerce keys needed.
 * All data cached to SQLite for offline browsing.
 */

import { useQuery } from '@tanstack/react-query';
import { appApi } from './appApi';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { AppProduct, AppCategory } from './types';
import type { AppPost } from './hub';

/** Fetch Market products with optional filters */
export function useMarketProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
}) {
  const cacheParams = JSON.stringify(params || {});

  return useQuery<AppProduct[]>({
    queryKey: ['market', 'products', params],
    queryFn: async () => {
      try {
        const data = await appApi<AppProduct[]>('products', {
          site: 'market',
          per_page: params?.perPage || 12,
          page: params?.page || 1,
          category: params?.category,
          search: params?.search,
        });
        await cacheSet('market', 'products', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppProduct[]>('market', 'products', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Market product categories */
export function useMarketCategories() {
  return useQuery<AppCategory[]>({
    queryKey: ['market', 'categories'],
    queryFn: async () => {
      try {
        const data = await appApi<AppCategory[]>('categories', { site: 'market' });
        await cacheSet('market', 'categories', data);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppCategory[]>('market', 'categories');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

/** Fetch a single Market product */
export function useMarketProduct(id: number) {
  return useQuery<AppProduct | null>({
    queryKey: ['market', 'product', id],
    queryFn: async () => {
      try {
        const data = await appApi<AppProduct | null>('product', { site: 'market', id });
        if (data) await cacheSet('market', 'products', data, `id-${id}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppProduct>('market', 'products', `id-${id}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!id,
  });
}

/** Fetch Market blog posts */
export function useMarketPosts(perPage: number = 10) {
  return useQuery<AppPost[]>({
    queryKey: ['market', 'posts', perPage],
    queryFn: async () => {
      try {
        const data = await appApi<AppPost[]>('posts', { site: 'market', per_page: perPage });
        await cacheSet('market', 'posts', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPost[]>('market', 'posts', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
