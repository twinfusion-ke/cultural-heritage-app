/**
 * App API — Unified client for the custom PHP API
 *
 * All data comes from a single PHP endpoint that reads
 * directly from the WordPress database. No WooCommerce keys needed.
 *
 * Usage: const data = await appApi('products', { site: 'market', per_page: 12 })
 */

import axios from 'axios';
import { useEnvStore } from '../stores/envStore';

export async function appApi<T = any>(
  action: string,
  params: Record<string, any> = {}
): Promise<T> {
  const { urls } = useEnvStore.getState();
  const { data } = await axios.get(urls.api, {
    params: { action, ...params },
    timeout: 15000,
  });
  return data;
}
