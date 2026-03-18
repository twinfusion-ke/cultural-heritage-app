/**
 * Main Hub API — Posts & Pages
 *
 * Fetches blog posts and pages from the main Cultural Heritage site.
 * All data is cached to SQLite for offline browsing.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
import { cacheSet, cacheGet } from '../db/contentCache';
import type { WPPost, WPPage } from '../types/wordpress';

function useHubUrl() {
  return useEnvStore((s) => s.urls.hub.rest);
}

/** Fetch blog posts from Main Hub */
export function useHubPosts(perPage: number = 10, page: number = 1) {
  const baseUrl = useHubUrl();
  const cacheParams = `${perPage}-${page}`;

  return useQuery<WPPost[]>({
    queryKey: ['hub', 'posts', perPage, page],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/posts`, {
          params: { per_page: perPage, page, _embed: true },
        });
        await cacheSet('hub', 'posts', data, cacheParams);
        return data;
      } catch (error: any) {
        // Offline fallback
        const cached = await cacheGet<WPPost[]>('hub', 'posts', cacheParams);
        if (cached) return cached.data;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/** Fetch a single post by slug */
export function useHubPost(slug: string) {
  const baseUrl = useHubUrl();

  return useQuery<WPPost>({
    queryKey: ['hub', 'post', slug],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/posts`, {
          params: { slug, _embed: true },
        });
        const post = data[0];
        if (post) await cacheSet('hub', 'posts', post, `slug-${slug}`);
        return post;
      } catch (error: any) {
        const cached = await cacheGet<WPPost>('hub', 'posts', `slug-${slug}`);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!slug,
  });
}

/** Fetch a page by slug */
export function useHubPage(slug: string) {
  const baseUrl = useHubUrl();

  return useQuery<WPPage>({
    queryKey: ['hub', 'page', slug],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/pages`, {
          params: { slug },
        });
        const page = data[0];
        if (page) await cacheSet('hub', 'pages', page, slug);
        return page;
      } catch (error: any) {
        const cached = await cacheGet<WPPage>('hub', 'pages', slug);
        if (cached) return cached.data;
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
  });
}
