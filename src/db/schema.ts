/**
 * SQLite Database Schema v2
 *
 * Local-first tables for offline functionality:
 * - content_cache: Cached API responses for offline browsing
 * - outbox: Pending mutations (orders, enquiries) queued for sync
 * - telemetry: Usage logging (session, screen, action)
 * - users_local: Offline user registration
 */

export const SCHEMA_VERSION = 2;

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS content_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL UNIQUE,
    site TEXT NOT NULL,
    content_type TEXT NOT NULL,
    data TEXT NOT NULL,
    cached_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cache_key ON content_cache(cache_key);
  CREATE INDEX IF NOT EXISTS idx_cache_expires ON content_cache(expires_at);

  CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    site TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'POST',
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    synced_at TEXT
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    screen TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'view',
    duration_ms INTEGER DEFAULT 0,
    metadata TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    synced INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users_local (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT NOT NULL DEFAULT 'pending',
    remote_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );
`;
