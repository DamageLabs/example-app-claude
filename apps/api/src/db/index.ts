import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createDatabase } from './connection.js';
import * as schema from './schema.js';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const sqlite = createDatabase();
    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export function createDb(dbPath?: string) {
  const sqlite = createDatabase(dbPath);
  return drizzle(sqlite, { schema });
}

export { schema };
