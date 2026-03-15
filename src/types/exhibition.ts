/**
 * Exhibition Custom Post Type (Gallery Site Only)
 */

export interface Exhibition {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  featured_media: number;
  date: string;
  meta: {
    _ch_exhibition_start_date: string;
    _ch_exhibition_end_date: string;
  };
  exhibition_type: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details: {
        sizes: Record<string, { source_url: string }>;
      };
    }>;
  };
}

export type ExhibitionStatus = 'Now Showing' | 'Upcoming' | 'Past';

export interface ExhibitionType {
  id: number;
  name: string;
  slug: string;
  count: number;
}
