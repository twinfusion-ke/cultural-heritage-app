/**
 * Outbox Pattern — CRUD Operations
 *
 * Queue mutations offline, flush when back online.
 * Items are processed in chronological order (FIFO).
 */

import { getDatabase } from './database';
import type { SiteKey } from '../config/environment';

export interface OutboxItem {
  id: number;
  type: string;
  site: SiteKey;
  endpoint: string;
  method: string;
  payload: string;
  created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
  retry_count: number;
  last_error: string | null;
  synced_at: string | null;
}

/** Add a mutation to the outbox queue */
export async function addToOutbox(
  type: string,
  site: SiteKey,
  endpoint: string,
  payload: object,
  method: string = 'POST'
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO outbox (type, site, endpoint, method, payload) VALUES (?, ?, ?, ?, ?)`,
    type, site, endpoint, method, JSON.stringify(payload)
  );
  return result.lastInsertRowId;
}

/** Get all pending items in chronological order */
export async function getPendingItems(): Promise<OutboxItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<OutboxItem>(
    `SELECT * FROM outbox WHERE sync_status = 'pending' ORDER BY created_at ASC`
  );
}

/** Get count of pending items */
export async function getPendingCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM outbox WHERE sync_status = 'pending'`
  );
  return result?.count ?? 0;
}

/** Mark an item as synced */
export async function markSynced(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE outbox SET sync_status = 'synced', synced_at = datetime('now') WHERE id = ?`,
    id
  );
}

/** Mark an item as failed with error */
export async function markFailed(id: number, error: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE outbox SET sync_status = 'failed', retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
    error, id
  );
}

/** Reset failed items back to pending (for retry) */
export async function retryFailed(maxRetries: number = 5): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE outbox SET sync_status = 'pending' WHERE sync_status = 'failed' AND retry_count < ?`,
    maxRetries
  );
}

/** Clean up old synced items (keep last 7 days) */
export async function cleanupSynced(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM outbox WHERE sync_status = 'synced' AND synced_at < datetime('now', '-7 days')`
  );
}
