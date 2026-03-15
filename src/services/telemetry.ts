/**
 * Usage Telemetry Service
 *
 * Records session duration and screen interactions locally.
 * Syncs to WordPress Main Hub as batch when online.
 */

import { getDatabase } from '../db/database';
import { addToOutbox } from '../db/outbox';
import * as Constants from 'expo-constants';

let currentSessionId: string = '';
let sessionStartTime: number = 0;

/** Generate a unique session ID */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Start a new telemetry session */
export function startSession(): void {
  currentSessionId = generateSessionId();
  sessionStartTime = Date.now();
}

/** Record a screen view */
export async function trackScreen(screen: string): Promise<void> {
  if (!currentSessionId) startSession();

  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO telemetry (session_id, screen, action, metadata) VALUES (?, ?, 'view', ?)`,
    currentSessionId,
    screen,
    JSON.stringify({ app_version: Constants.default.expoConfig?.version || '1.0.0' })
  );
}

/** Record a user action */
export async function trackAction(screen: string, action: string, metadata?: object): Promise<void> {
  if (!currentSessionId) startSession();

  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO telemetry (session_id, screen, action, metadata) VALUES (?, ?, ?, ?)`,
    currentSessionId,
    screen,
    action,
    metadata ? JSON.stringify(metadata) : null
  );
}

/** End session and record duration */
export async function endSession(): Promise<void> {
  if (!currentSessionId || !sessionStartTime) return;

  const duration = Date.now() - sessionStartTime;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO telemetry (session_id, screen, action, duration_ms) VALUES (?, 'app', 'session_end', ?)`,
    currentSessionId,
    duration
  );

  currentSessionId = '';
  sessionStartTime = 0;
}

/** Sync unsynced telemetry data to the hub (batched) */
export async function syncTelemetry(): Promise<void> {
  const db = await getDatabase();
  const unsyncedRows = await db.getAllAsync<{
    id: number;
    session_id: string;
    screen: string;
    action: string;
    duration_ms: number;
    metadata: string | null;
    timestamp: string;
  }>(
    `SELECT * FROM telemetry WHERE synced = 0 ORDER BY timestamp ASC LIMIT 100`
  );

  if (unsyncedRows.length === 0) return;

  // Queue batch as a single outbox item
  const batch = unsyncedRows.map((row) => ({
    session_id: row.session_id,
    screen: row.screen,
    action: row.action,
    duration_ms: row.duration_ms,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    timestamp: row.timestamp,
  }));

  await addToOutbox(
    'telemetry',
    'hub',
    '/wp-json/ch-app/v1/telemetry',
    { events: batch },
    'POST'
  );

  // Mark as synced locally (outbox handles the actual push)
  const ids = unsyncedRows.map((r) => r.id);
  await db.runAsync(
    `UPDATE telemetry SET synced = 1 WHERE id IN (${ids.join(',')})`
  );
}
