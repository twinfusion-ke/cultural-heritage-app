/**
 * App API Response Types
 *
 * These types match the JSON returned by our custom PHP API.
 * Simpler than WordPress/WooCommerce REST API types.
 */

export interface AppProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  sku: string;
  images: { src: string; alt: string }[];
  attributes: { name: string; options: string[]; visible: boolean }[];
  categories: { id: number; name: string; slug: string }[];
  date: string;
}

export interface AppCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface AppExhibition {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  start_date: string;
  end_date: string;
  image: string | null;
}

export interface AppSearchResult {
  type: 'product' | 'post' | 'page';
  site: string;
  site_name: string;
  id: number;
  title: string;
  price?: string;
  image?: string | null;
  excerpt?: string;
  slug?: string;
}
