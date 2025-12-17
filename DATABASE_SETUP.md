# Database Setup Guide

## Overview

The Security RAT project uses **SQLite** as its database, not PostgreSQL. The database is automatically created and managed when the backend server starts.

## Database Location

The SQLite database file is located at:
```
apps/backend/data/security-rat.db
```

## Database Schema

The database includes the following tables:

1. **users** - User accounts
2. **questionnaires** - Security questionnaires
3. **questionnaire_answers** - User responses to questionnaires
4. **shortlists** - Generated security requirement shortlists
5. **requirement_status** - Status tracking for requirements
6. **comments** - Comments on requirements
7. **external_references** - Links to external systems (Jira, Rally, etc.)
8. **audit_log** - Audit trail of user actions
9. **webhooks** - Webhook configurations
10. **webhook_logs** - Webhook delivery logs
11. **migrations** - Migration tracking

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

Run the database setup script:
```bash
./tools/setup-db.sh
```

This will:
1. Build the backend if needed
2. Create the database file
3. Run all migrations
4. Verify the setup

### Option 2: Manual Setup

1. **Build the backend:**
   ```bash
   cd apps/backend
   npm run build
   cd ../..
   ```

2. **Start the backend server:**
   ```bash
   cd apps/backend
   npm run dev
   ```
   The database will be automatically created when the server starts.

3. **Verify the database:**
   ```bash
   cd apps/backend
   node -e "
   import { fileURLToPath } from 'url';
   import { dirname } from 'path';
   import { initializeDatabase, closeDatabase } from './dist/database.js';

   const __dirname = dirname(fileURLToPath(import.meta.url));

   (async () => {
     const db = await initializeDatabase();
     const tables = await db.all('SELECT name FROM sqlite_master WHERE type=\"table\"');
     console.log('Tables:', tables.map(t => t.name).join(', '));
     await closeDatabase(db);
   })();
   "
   ```

## Migrations

Database migrations are stored in:
```
apps/backend/src/migrations/
```

The system automatically applies pending migrations when the database is initialized.

### Creating a New Migration

1. Create a new SQL file in `apps/backend/src/migrations/` with a numeric prefix (e.g., `002_add_new_table.sql`)
2. Add your SQL statements to the file
3. The migration will be automatically applied on next startup

## Connecting to the Database

You can use the SQLite3 command-line tool to connect to the database:

```bash
cd apps/backend
sqlite3 data/security-rat.db
```

Or use a GUI tool like:
- DB Browser for SQLite
- TablePlus
- DBeaver

## Troubleshooting

### Database not being created

If the database file doesn't appear:
1. Make sure you've built the backend: `npm run build`
2. Check that the `apps/backend/data/` directory exists and is writable
3. Try running the setup script: `./tools/setup-db.sh`

### Missing tables

If tables are missing:
1. Delete the database file: `rm apps/backend/data/security-rat.db`
2. Rebuild the backend: `npm run build`
3. Restart the server or run the setup script

### Permission issues

On macOS/Linux, ensure the data directory has proper permissions:
```bash
mkdir -p apps/backend/data
chmod 755 apps/backend/data
```

## PostgreSQL Note

The project **does not use PostgreSQL**. If you see references to PostgreSQL in documentation or error messages, they are likely from a different context or outdated information. The Security RAT project uses SQLite exclusively.
