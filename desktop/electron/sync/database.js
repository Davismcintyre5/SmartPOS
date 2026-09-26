import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';
import { createLogger } from '../logger.js';
import { runMigrations } from './migrations.js';

const log = createLogger('sync:database');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

export function getDatabasePath() {
  const dir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'smartpos.db');
}

export function getDatabase() {
  if (db) return db;

  const dbPath = getDatabasePath();
  log.info('Opening SQLite database at', dbPath);

  db = new DatabaseSync(dbPath);

  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA synchronous = NORMAL');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  runMigrations(db);

  log.info('Database ready');
  return db;
}

export function closeDatabase() {
  if (db) {
    try {
      db.close();
      log.info('Database closed');
    } catch (err) {
      log.error('Close failed:', err.message);
    }
    db = null;
  }
}

export function prepare(sql) {
  const database = getDatabase();
  const stmt = database.prepare(sql);

  return {
    run: (params) => {
      if (params === undefined) return stmt.run();
      if (Array.isArray(params)) return stmt.run(...params);
      return stmt.run(params);
    },
    get: (params) => {
      if (params === undefined) return stmt.get();
      if (Array.isArray(params)) return stmt.get(...params);
      return stmt.get(params);
    },
    all: (params) => {
      if (params === undefined) return stmt.all();
      if (Array.isArray(params)) return stmt.all(...params);
      return stmt.all(params);
    },
  };
}

export function exec(sql) {
  return getDatabase().exec(sql);
}

export function transaction(fn) {
  return (...args) => {
    const database = getDatabase();
    database.exec('BEGIN');
    try {
      const result = fn(...args);
      database.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        database.exec('ROLLBACK');
      } catch (rollbackErr) {
        log.error('Rollback failed:', rollbackErr.message);
      }
      throw err;
    }
  };
}