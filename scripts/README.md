# Database Scripts

## Seed Admin User

To create a default admin user, run the seed script:

```bash
# Connect to PostgreSQL
psql -h localhost -U securityrat -d securityrat

# Run the seed script
\i scripts/seed-admin.sql
```

### Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: `security-lead`

## Notes

- **Registration is currently broken** - The registration endpoint exists but needs to be fixed
- The seed script uses `INSERT OR IGNORE` so it won't duplicate users if run multiple times
- The password hash in the seed script is for "password123"

## Database Connection

```bash
# Connect to PostgreSQL
psql -h localhost -U securityrat -d securityrat

# Credentials
Username: securityrat
Password: securityrat
Database: securityrat
Host: localhost
Port: 5432
```

## Running Migrations

Migrations are automatically run when the backend starts. They are located in:
- `apps/backend/src/migrations/`
