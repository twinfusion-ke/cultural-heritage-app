/**
 * Date Utilities
 *
 * Exhibition status logic and formatting.
 */

import type { ExhibitionStatus } from '../types/exhibition';

/** Determine exhibition status from start/end dates */
export function getExhibitionStatus(startDate: string, endDate: string): ExhibitionStatus {
  const today = new Date().toISOString().split('T')[0];
  if (today >= startDate && today <= endDate) return 'Now Showing';
  if (today < startDate) return 'Upcoming';
  return 'Past';
}

/** Format date: "2026-01-10" → "January 10, 2026" */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format date range: "Jan 10 — Jul 15, 2026" */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `${startStr} — ${endStr}`;
}

/** Calculate reading time from HTML content */
export function readingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 250));
}
