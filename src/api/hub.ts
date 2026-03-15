/**
 * Main Hub API — Posts & Pages
 *
 * Fetches blog posts and pages from the main Cultural Heritage site.
 */

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useEnvStore } from '../stores/envStore';
import type { WPPost, WPPage } from '../types/wordpress';

function useHubUrl() {
  return useEnvStore((s) => s.urls.hub.rest);
}

/** Fetch blog posts from Main Hub */
export function useHubPosts(perPage: number = 10, page: number = 1) {
  const baseUrl = useHubUrl();

  return useQuery<WPPost[]>({
    queryKey: ['hub', 'posts', perPage, page],
    queryFn: async () => {
      const { data } = await axios.get(`${baseUrl}/posts`, {
        params: { per_page: perPage, page, _embed: true },
      });
      return data;
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
      const { data } = await axios.get(`${baseUrl}/posts`, {
        params: { slug, _embed: true },
      });
      return data[0];
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
      const { data } = await axios.get(`${baseUrl}/pages`, {
        params: { slug },
      });
      return data[0];
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60, // 1 hour for static pages
  });
}
