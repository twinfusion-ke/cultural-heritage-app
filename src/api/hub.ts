/**
 * Main Hub API — Posts & Pages
 *
 * Uses the custom PHP API. No WooCommerce keys needed.
 * All data cached to SQLite for offline browsing.
 */

import { useQuery } from '@tanstack/react-query';
import { appApi } from './appApi';
import { cacheSet, cacheGet } from '../db/contentCache';

interface AppPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  image: string | null;
  categories: { id: number; name: string; slug: string }[];
}

interface AppPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string | null;
}

/** Fetch blog posts from Main Hub */
export function useHubPosts(perPage: number = 10, page: number = 1) {
  const cacheParams = `${perPage}-${page}`;

  return useQuery<AppPost[]>({
    queryKey: ['hub', 'posts', perPage, page],
    queryFn: async () => {
      try {
        const data = await appApi<AppPost[]>('posts', { site: 'hub', per_page: perPage, page });
        await cacheSet('hub', 'posts', data, cacheParams);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPost[]>('hub', 'posts', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch a single post by slug */
export function useHubPost(slug: string) {
  return useQuery<AppPost | null>({
    queryKey: ['hub', 'post', slug],
    queryFn: async () => {
      try {
        const data = await appApi<AppPost | null>('post', { site: 'hub', slug });
        if (data) await cacheSet('hub', 'posts', data, `slug-${slug}`);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPost>('hub', 'posts', `slug-${slug}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!slug,
  });
}

/** Fetch a page by slug */
export function useHubPage(slug: string) {
  return useQuery<AppPage | null>({
    queryKey: ['hub', 'page', slug],
    queryFn: async () => {
      try {
        const data = await appApi<AppPage | null>('page', { site: 'hub', slug });
        if (data) await cacheSet('hub', 'pages', data, slug);
        return data;
      } catch (error: any) {
        const cached = await cacheGet<AppPage>('hub', 'pages', slug);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
  });
}

export type { AppPost, AppPage };
