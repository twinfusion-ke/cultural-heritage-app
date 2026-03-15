/**
 * SQLite Database Initialization
 *
 * Opens/creates the local database on first run.
 * No API handshake required — works fully offline.
 */

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('cultural_heritage.db');

  // Enable WAL mode for better concurrent performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await db.execAsync(CREATE_TABLES);

  // Check schema version
  const result = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1'
  );

  if (!result) {
    await db.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      SCHEMA_VERSION
    );
  }

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
