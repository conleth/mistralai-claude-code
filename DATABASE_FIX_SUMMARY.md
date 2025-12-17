# Database Fix Summary

## Problem

The user was trying to connect to a PostgreSQL database (`psql -h localhost -U securityrat -d securityrat`) but the project actually uses SQLite, not PostgreSQL. The database tables were not properly created and the migration tracking was incomplete.

## Root Causes

1. **Missing Table Definition**: The migration SQL file (`apps/backend/src/migrations/001_create_tables.sql`) referenced an `external_references` table in indexes but never created the table itself.

2. **TypeScript Compilation Issues**: The `database.ts` file had incorrect imports for the sqlite3 module that prevented proper compilation.

3. **Missing Setup Documentation**: There was no clear documentation about the database setup process.

## Fixes Applied

### 1. Added Missing Table

Added the `external_references` table definition to the migration file:

```sql
-- Create ExternalReferences table
CREATE TABLE IF NOT EXISTS external_references (
  id TEXT PRIMARY KEY,
  shortlist_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shortlist_id) REFERENCES shortlists(id),
  UNIQUE(shortlist_id, requirement_id, external_system)
);
```

### 2. Fixed TypeScript Imports

Updated `apps/backend/src/database.ts` to:
- Remove duplicate `Database` import
- Use `sqlite3.Database` instead of just `Database`
- Add ES module compatible `__dirname` calculation using `fileURLToPath`
- Adjust migration path to point to `../src/migrations` for proper deployment

### 3. Created Setup Scripts

Created two new tools:

- **`tools/setup-db.sh`**: Automated database setup script that:
  - Builds the backend if needed
  - Creates the database file
  - Runs all migrations
  - Verifies the setup

- **`tools/db-check.sh`**: Database verification script

### 4. Added Documentation

Created comprehensive documentation:

- **`DATABASE_SETUP.md`**: Complete guide to database setup, usage, and troubleshooting
- Updated **`README.md`** with database information

## Verification

The database is now properly set up with all 12 tables:

```
apps/backend/data/security-rat.db
```

Tables created:
- audit_log
- comments
- external_references
- migrations
- questionnaire_answers
- questionnaires
- requirement_status
- shortlists
- sqlite_sequence
- users
- webhook_logs
- webhooks

## Usage

To set up the database:

```bash
./tools/setup-db.sh
```

To verify the database:

```bash
./tools/db-check.sh
```

## Important Note

The project **does not use PostgreSQL**. It uses SQLite exclusively. Any attempts to connect via `psql` will fail because there is no PostgreSQL database configured or running.
