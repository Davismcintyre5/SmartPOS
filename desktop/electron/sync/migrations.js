import { createLogger } from '../logger.js';

const log = createLogger('sync:migrations');

export const MIGRATIONS = [
  {
    version: 1,
    name: 'initial',
    up(db) {
      log.info('Applying initial schema');
      // schema.sql is applied separately on first run
    },
  },
];

export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL,
      name TEXT
    );
  `);

  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
  const current = row?.v || 0;

  const pending = MIGRATIONS.filter((m) => m.version > current);

  if (pending.length === 0) {
    log.info('Schema up to date at version', current);
    return current;
  }

  for (const migration of pending) {
    log.info(`Applying migration ${migration.version}: ${migration.name}`);
    try {
      migration.up(db);
      db.prepare(
        'INSERT INTO schema_version (version, applied_at, name) VALUES (?, ?, ?)'
      ).run(migration.version, new Date().toISOString(), migration.name);
    } catch (err) {
      log.error(`Migration ${migration.version} failed:`, err.message);
      throw err;
    }
  }

  const updated = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
  log.info('Migrations complete. Now at version', updated.v);
  return updated.v;
}