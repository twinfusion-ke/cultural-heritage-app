/**
 * Gallery API — Art, Exhibitions, POS
 *
 * Fetches exhibitions (CPT), art products, and blog posts.
 * Also exposes POS API for in-store integration.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
import type { Exhibition, ExhibitionType } from '../types/exhibition';
import type { WCProduct } from '../types/woocommerce';
import type { WPPost } from '../types/wordpress';

function useGalleryUrls() {
  return useEnvStore((s) => s.urls.gallery);
}

function useWcAuth() {
  const env = useEnvStore((s) => s.env);
  return env.wcConsumerKey
    ? { consumer_key: env.wcConsumerKey, consumer_secret: env.wcConsumerSecret }
    : {};
}

/** Fetch all exhibitions */
export function useExhibitions(perPage: number = 50) {
  const urls = useGalleryUrls();

  return useQuery<Exhibition[]>({
    queryKey: ['gallery', 'exhibitions', perPage],
    queryFn: async () => {
      const { data } = await axios.get(`${urls.rest}/ch_exhibition`, {
        params: { per_page: perPage, _embed: true },
      });
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 min — exhibitions change infrequently
  });
}

/** Fetch a single exhibition by slug */
export function useExhibition(slug: string) {
  const urls = useGalleryUrls();

  return useQuery<Exhibition>({
    queryKey: ['gallery', 'exhibition', slug],
    queryFn: async () => {
      const { data } = await axios.get(`${urls.rest}/ch_exhibition`, {
        params: { slug, _embed: true },
      });
      return data[0];
    },
    enabled: !!slug,
  });
}

/** Fetch exhibition type taxonomy terms */
export function useExhibitionTypes() {
  const urls = useGalleryUrls();

  return useQuery<ExhibitionType[]>({
    queryKey: ['gallery', 'exhibitionTypes'],
    queryFn: async () => {
      const { data } = await axios.get(`${urls.rest}/exhibition_type`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

/** Fetch Gallery art products */
export function useGalleryProducts(params?: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
  orderby?: string;
}) {
  const urls = useGalleryUrls();
  const auth = useWcAuth();

  return useQuery<WCProduct[]>({
    queryKey: ['gallery', 'products', params],
    queryFn: async () => {
      const { data } = await axios.get(`${urls.wc}/products`, {
        params: {
          per_page: params?.perPage || 12,
          page: params?.page || 1,
          category: params?.category,
          search: params?.search,
          orderby: params?.orderby || 'date',
          order: 'desc',
          status: 'publish',
          ...auth,
        },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch Gallery blog posts (Art Journal) */
export function useGalleryPosts(perPage: number = 10) {
  const urls = useGalleryUrls();

  return useQuery<WPPost[]>({
    queryKey: ['gallery', 'posts', perPage],
    queryFn: async () => {
      const { data } = await axios.get(`${urls.rest}/posts`, {
        params: { per_page: perPage, _embed: true },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
