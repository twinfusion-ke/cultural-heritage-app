/**
 * Background Sync Service
 *
 * Listens for network restoration and flushes the outbox queue.
 * Items are committed to the live production API in FIFO order.
 */

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { getApiClients } from '../api/client';
import {
  getPendingItems,
  markSynced,
  markFailed,
  retryFailed,
  cleanupSynced,
  getPendingCount,
} from '../db/outbox';
import type { SiteKey } from '../config/environment';

let isSyncing = false;
let unsubscribe: (() => void) | null = null;

/** Subscribers notified when pending count changes */
type SyncListener = (pendingCount: number) => void;
const listeners: Set<SyncListener> = new Set();

export function onSyncChange(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function notifyListeners() {
  const count = await getPendingCount();
  listeners.forEach((fn) => fn(count));
}

/** Flush all pending outbox items to the live API */
async function flushOutbox(): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Retry previously failed items
    await retryFailed(5);

    const items = await getPendingItems();
    if (items.length === 0) {
      isSyncing = false;
      return;
    }

    const clients = getApiClients();

    for (const item of items) {
      try {
        const payload = JSON.parse(item.payload);
        const client = getClientForSite(clients, item.site, item.endpoint);

        if (item.method === 'POST') {
          await client.post(item.endpoint, payload);
        } else if (item.method === 'PUT') {
          await client.put(item.endpoint, payload);
        } else if (item.method === 'DELETE') {
          await client.delete(item.endpoint);
        }

        await markSynced(item.id);
        await notifyListeners();
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Unknown error';
        await markFailed(item.id, message);
      }
    }

    // Clean up old synced records
    await cleanupSynced();
  } finally {
    isSyncing = false;
    await notifyListeners();
  }
}

/** Resolve the correct Axios instance for a site + endpoint */
function getClientForSite(clients: ReturnType<typeof getApiClients>, site: SiteKey, endpoint: string) {
  switch (site) {
    case 'hub':
      return clients.hub;
    case 'market':
      return endpoint.includes('/wc/') ? clients.market.wc : clients.market.rest;
    case 'jewelry':
      return endpoint.includes('/wc/') ? clients.jewelry.wc : clients.jewelry.rest;
    case 'gallery':
      if (endpoint.includes('/pos/')) return clients.gallery.pos;
      if (endpoint.includes('/wc/')) return clients.gallery.wc;
      return clients.gallery.rest;
    default:
      return clients.hub;
  }
}

/** Start listening for network changes */
export function startSyncService(): void {
  if (unsubscribe) return; // Already running

  unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      // Network restored — flush pending items
      flushOutbox();
    }
  });

  // Also flush immediately on start (in case we came online while app was closed)
  NetInfo.fetch().then((state) => {
    if (state.isConnected) {
      flushOutbox();
    }
  });
}

/** Stop the sync service */
export function stopSyncService(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

/** Manually trigger a sync attempt */
export async function triggerSync(): Promise<void> {
  const state = await NetInfo.fetch();
  if (state.isConnected) {
    await flushOutbox();
  }
}
