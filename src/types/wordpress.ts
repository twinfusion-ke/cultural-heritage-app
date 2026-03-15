/**
 * WordPress REST API Response Types
 */

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified: string;
  slug: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  author: number;
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    author?: WPAuthor[];
  };
}

export interface WPPage {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  featured_media: number;
  parent: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: Record<string, {
      source_url: string;
      width: number;
      height: number;
    }>;
  };
}

export interface WPAuthor {
  id: number;
  name: string;
  avatar_urls: Record<string, string>;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}
