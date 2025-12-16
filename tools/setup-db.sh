#!/usr/bin/env bash

# Database setup script for Security RAT

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "Security RAT - Database Setup"
echo "=========================================="
echo ""

# Check if backend is built
if [ ! -d "apps/backend/dist" ]; then
  echo "Building backend..."
  cd apps/backend
  npm run build
  cd "$PROJECT_ROOT"
  echo "Backend built successfully"
  echo ""
fi

# Check if database exists
DB_PATH="apps/backend/data/security-rat.db"
if [ ! -f "$DB_PATH" ]; then
  echo "Database file not found. Creating..."
  cd apps/backend
  node -e "
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeDatabase, closeDatabase } from './dist/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    const db = await initializeDatabase();
    await closeDatabase(db);
    console.log('Database created successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
"
  cd "$PROJECT_ROOT"
  echo ""
fi

# Verify database
cd apps/backend
node -e "
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeDatabase, closeDatabase } from './dist/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    const db = await initializeDatabase();
    
    console.log('Database verification:');
    console.log('=====================');
    
    // Check tables
    const tables = await db.all('SELECT name FROM sqlite_master WHERE type=\"table\" ORDER BY name');
    console.log('\nTables (' + tables.length + '):');
    tables.forEach(row => console.log('  ✓', row.name));
    
    // Check migrations
    const migrations = await db.all('SELECT id, name, applied_at FROM migrations ORDER BY id');
    console.log('\nMigrations (' + migrations.length + '):');
    migrations.forEach(row => console.log('  ✓', row.name, '(', row.applied_at, ')'));
    
    await closeDatabase(db);
    console.log('\n✓ Database setup complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
"
cd "$PROJECT_ROOT"

echo ""
echo "=========================================="
echo "Next steps:"
echo "  npm run dev          # Start development servers"
echo "  npm run typecheck    # Verify TypeScript"
echo "=========================================="
