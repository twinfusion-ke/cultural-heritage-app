/**
 * Jewelry / Vault API — Luxury Products
 *
 * Fetches tanzanite and fine jewelry from The Vault sub-site.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
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

  return useQuery<WCProduct[]>({
    queryKey: ['jewelry', 'products', params],
    queryFn: async () => {
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
      return data;
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
      const { data } = await axios.get(`${urls.wc}/products/categories`, {
        params: { per_page: 50, ...auth },
      });
      return data;
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
      const { data } = await axios.get(`${urls.wc}/products/${id}`, {
        params: auth,
      });
      return data;
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
      const { data } = await axios.get(`${urls.rest}/posts`, {
        params: { per_page: perPage, _embed: true },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
