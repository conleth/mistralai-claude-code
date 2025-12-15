/**
 * Database connection and migration utility
 */

import sqlite3 from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';
import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Database configuration
const DB_PATH = path.join(process.cwd(), 'data', 'security-rat.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<SqliteDatabase> {
  console.log(`Initializing database at ${DB_PATH}`);
  
  const db = await open({
    filename: DB_PATH,
    driver: Database,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  });

  // Run migrations
  await runMigrations(db);
  
  console.log('Database initialized successfully');
  return db;
}

/**
 * Run all pending migrations
 */
async function runMigrations(db: SqliteDatabase): Promise<void> {
  console.log('Running migrations...');
  
  // Check if migrations table exists
  const result = await db.get(
    'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'migrations\''
  );
  
  if (!result) {
    // Create migrations table
    await db.exec(
      `CREATE TABLE migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
  }
  
  // Get already applied migrations
  const appliedMigrations: Array<{ name: string }> = await db.all(
    'SELECT name FROM migrations ORDER BY id'
  );
  
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, '.sql');
    
    if (!appliedMigrations.some((m: { name: string }) => m.name === migrationName)) {
      console.log(`Applying migration: ${migrationName}`);
      
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      await db.exec(sql);
      
      // Mark migration as applied
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        migrationName
      );
    }
  }
  
  console.log('Migrations completed');
}

/**
 * Close database connection
 */
export async function closeDatabase(db: SqliteDatabase): Promise<void> {
  await db.close();
}

// Export types for convenience
export type { Database as SqliteDatabase } from 'sqlite';
