/**
 * Jewelry / Vault API — Luxury Products
 *
 * Fetches tanzanite and fine jewelry from The Vault sub-site.
 * All data cached to SQLite for offline browsing.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { WCProduct, WCCategory } from '../types/woocommerce';
import type { WPPost } from '../types/wordpress';

function useJewelryUrls() {
  return useEnvStore((s) => s.urls.jewelry);
}

function useWcAuth() {
  const env = useEnvStore((s) => s.env);
  return env.wcConsumerKey
    ? { consumer_key: env.wcConsumerKey, consumer_secret: env.wcConsumerSecret }
    : {};
}

/** Fetch Jewelry products with filters */
export function useJewelryProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  orderby?: string;
  order?: string;
  attribute?: string;
  attributeTerm?: string;
}) {
  const urls = useJewelryUrls();
  const auth = useWcAuth();
  const cacheParams = JSON.stringify(params || {});

  return useQuery<WCProduct[]>({
    queryKey: ['jewelry', 'products', params],
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
            attribute: params?.attribute,
            attribute_term: params?.attributeTerm,
            status: 'publish',
            ...auth,
          },
        });
        await cacheSet('jewelry', 'products', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCProduct[]>('jewelry', 'products', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Jewelry categories */
export function useJewelryCategories() {
  const urls = useJewelryUrls();
  const auth = useWcAuth();

  return useQuery<WCCategory[]>({
    queryKey: ['jewelry', 'categories'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.wc}/products/categories`, {
          params: { per_page: 50, ...auth },
        });
        await cacheSet('jewelry', 'categories', data);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCCategory[]>('jewelry', 'categories');
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

/** Fetch single Jewelry product (for detail + deep-zoom) */
export function useJewelryProduct(id: number) {
  const urls = useJewelryUrls();
  const auth = useWcAuth();

  return useQuery<WCProduct>({
    queryKey: ['jewelry', 'product', id],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.wc}/products/${id}`, {
          params: auth,
        });
        await cacheSet('jewelry', 'products', data, `id-${id}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WCProduct>('jewelry', 'products', `id-${id}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!id,
  });
}

/** Fetch Jewelry blog posts (Gem Journal) */
export function useJewelryPosts(perPage: number = 10) {
  const urls = useJewelryUrls();

  return useQuery<WPPost[]>({
    queryKey: ['jewelry', 'posts', perPage],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${urls.rest}/posts`, {
          params: { per_page: perPage, _embed: true },
        });
        await cacheSet('jewelry', 'posts', data, `${perPage}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<WPPost[]>('jewelry', 'posts', `${perPage}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
