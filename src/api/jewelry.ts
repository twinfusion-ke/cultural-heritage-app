/**
 * Jewelry / Vault API — Luxury Products
 *
 * Uses the custom PHP API. No WooCommerce keys needed.
 * All data cached to SQLite for offline browsing.
 */

import { useQuery } from '@tanstack/react-query';
import { appApi } from './appApi';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { AppProduct, AppCategory } from './types';
import type { AppPost } from './hub';

/** Fetch Jewelry products with filters */
export function useJewelryProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
}) {
  const cacheParams = JSON.stringify(params || {});

  return useQuery<AppProduct[]>({
    queryKey: ['jewelry', 'products', params],
    queryFn: async () => {
      try {
        const data = await appApi<AppProduct[]>('products', {
          site: 'jewelry',
          per_page: params?.perPage || 12,
          page: params?.page || 1,
          category: params?.category,
          search: params?.search,
        });
        await cacheSet('jewelry', 'products', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppProduct[]>('jewelry', 'products', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Jewelry categories */
export function useJewelryCategories() {
  return useQuery<AppCategory[]>({
    queryKey: ['jewelry', 'categories'],
    queryFn: async () => {
      try {
        const data = await appApi<AppCategory[]>('categories', { site: 'jewelry' });
        await cacheSet('jewelry', 'categories', data);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppCategory[]>('jewelry', 'categories');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

/** Fetch single Jewelry product */
export function useJewelryProduct(id: number) {
  return useQuery<AppProduct | null>({
    queryKey: ['jewelry', 'product', id],
    queryFn: async () => {
      try {
        const data = await appApi<AppProduct | null>('product', { site: 'jewelry', id });
        if (data) await cacheSet('jewelry', 'products', data, `id-${id}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppProduct>('jewelry', 'products', `id-${id}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!id,
  });
}

/** Fetch Jewelry blog posts (Gem Journal) */
export function useJewelryPosts(perPage: number = 10) {
  return useQuery<AppPost[]>({
    queryKey: ['jewelry', 'posts', perPage],
    queryFn: async () => {
      try {
        const data = await appApi<AppPost[]>('posts', { site: 'jewelry', per_page: perPage });
        await cacheSet('jewelry', 'posts', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPost[]>('jewelry', 'posts', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
