#!/usr/bin/env bash

# Database check script for Security RAT

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Checking SQLite database..."
echo ""

DB_PATH="apps/backend/data/security-rat.db"

if [ ! -f "$DB_PATH" ]; then
  echo "Database file not found at $DB_PATH"
  echo "Starting backend to create it..."
  cd apps/backend
  npm run dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!
  echo "Backend started with PID: $BACKEND_PID"
  echo "Waiting 5 seconds for database initialization..."
  sleep 5
  kill $BACKEND_PID 2>/dev/null || true
  echo "Backend stopped"
  echo ""
fi

if [ -f "$DB_PATH" ]; then
  echo "Database file exists at $DB_PATH"
  echo ""
  
  echo "Checking tables..."
  cd apps/backend
  node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/security-rat.db');
db.all('SELECT name FROM sqlite_master WHERE type=\"table\" ORDER BY name', (err, rows) => { 
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  console.log('Tables in database:');
  rows.forEach(row => console.log('  -', row.name));
  db.close();
});
"
  echo ""
  
  echo "Checking migrations..."
  node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/security-rat.db');
db.all('SELECT id, name, applied_at FROM migrations ORDER BY id', (err, rows) => { 
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  if (rows.length === 0) {
    console.log('No migrations applied');
  } else {
    console.log('Applied migrations:');
    rows.forEach(row => console.log('  -', row.name, '(', row.applied_at, ')'));
  }
  db.close();
});
"
  echo ""
  echo "Database check complete!"
else
  echo "ERROR: Database file could not be created"
  exit 1
fi
