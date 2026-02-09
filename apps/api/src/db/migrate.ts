import 'dotenv/config';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { createDatabase } from './connection.js';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  console.log('Running database migrations...');

  const sqlite = createDatabase();
  const db = drizzle(sqlite);

  // Run Drizzle migrations
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');
  migrate(db, { migrationsFolder });
  console.log('Drizzle migrations complete.');

  // Apply custom FTS5 SQL
  const ftsPath = path.resolve(__dirname, '../../drizzle/0001_fts5_and_triggers.sql');
  if (fs.existsSync(ftsPath)) {
    const ftsSql = fs.readFileSync(ftsPath, 'utf-8');
    sqlite.exec(ftsSql);
    console.log('FTS5 setup complete.');
  }

  sqlite.close();
  console.log('All migrations complete.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
