/**
 * Gallery API — Art, Exhibitions
 *
 * Uses the custom PHP API. No WooCommerce keys needed.
 * All data cached to SQLite for offline browsing.
 */

import { useQuery } from '@tanstack/react-query';
import { appApi } from './appApi';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { AppProduct, AppExhibition } from './types';
import type { AppPost } from './hub';

/** Fetch all exhibitions */
export function useExhibitions(perPage: number = 50) {
  return useQuery<AppExhibition[]>({
    queryKey: ['gallery', 'exhibitions', perPage],
    queryFn: async () => {
      try {
        const data = await appApi<AppExhibition[]>('exhibitions', { per_page: perPage });
        await cacheSet('gallery', 'exhibitions', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppExhibition[]>('gallery', 'exhibitions', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 15,
  });
}

/** Fetch a single exhibition by slug */
export function useExhibition(slug: string) {
  return useQuery<AppExhibition | null>({
    queryKey: ['gallery', 'exhibition', slug],
    queryFn: async () => {
      try {
        const data = await appApi<AppExhibition | null>('exhibition', { slug });
        if (data) await cacheSet('gallery', 'exhibitions', data, `slug-${slug}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppExhibition>('gallery', 'exhibitions', `slug-${slug}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!slug,
  });
}

/** Fetch Gallery art products */
export function useGalleryProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
}) {
  const cacheParams = JSON.stringify(params || {});

  return useQuery<AppProduct[]>({
    queryKey: ['gallery', 'products', params],
    queryFn: async () => {
      try {
        const data = await appApi<AppProduct[]>('products', {
          site: 'gallery',
          per_page: params?.perPage || 12,
          page: params?.page || 1,
          category: params?.category,
          search: params?.search,
        });
        await cacheSet('gallery', 'products', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppProduct[]>('gallery', 'products', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Gallery blog posts (Art Journal) */
export function useGalleryPosts(perPage: number = 10) {
  return useQuery<AppPost[]>({
    queryKey: ['gallery', 'posts', perPage],
    queryFn: async () => {
      try {
        const data = await appApi<AppPost[]>('posts', { site: 'gallery', per_page: perPage });
        await cacheSet('gallery', 'posts', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPost[]>('gallery', 'posts', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
