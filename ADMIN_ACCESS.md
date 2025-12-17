# Admin Access Guide

## Quick Start

### Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: `security-lead`

## Setup Instructions

### 1. Build the Application
```bash
./standup.sh
```

This will build all packages and apps.

### 2. Start Services
```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, Backend, and Frontend services.

### 3. Seed the Database (Create Admin User)

#### Option A: Using Docker Exec
```bash
docker exec -it security-rat-postgres psql -U securityrat -d securityrat -f /docker-entrypoint-initdb.d/seed-admin.sql
```

#### Option B: Manual SQL
```bash
# Connect to the database
psql -h localhost -U securityrat -d securityrat

# Run the seed script
\i scripts/seed-admin.sql
```

### 4. Access the Application

Open your browser and go to: `http://localhost:1234`

Log in with:
- Email: `admin@example.com`
- Password: `password123`

## Troubleshooting

### If admin user doesn't exist:
1. Check if the seed script was run
2. Manually run the seed script as shown above
3. Verify the user exists in the database:
   ```sql
   SELECT id, email, role FROM users;
   ```

### If you forget the password:
You can reset it by updating the password_hash in the database:
```sql
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq1F.33X/fdP2PJmYJfQ1zI7hJVzNq' WHERE email = 'admin@example.com';
```

(Note: This is the hash for "password123")

## Database Connection Details

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `securityrat`
- **Username**: `securityrat`
- **Password**: `securityrat`

## Important Notes

1. **Registration is currently broken** - The registration endpoint exists but needs to be fixed
2. The seed script uses `INSERT OR IGNORE` so it won't create duplicate users
3. The password hash in the seed script is for "password123"
4. For production, consider changing the default password

## Creating Additional Users

You can create additional users through the API or by inserting directly into the database:

```sql
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
  'your-uuid-here',
  'User Name',
  'user@example.com',
  '$2a$10$hashedpassword',
  'developer'
);
```

To generate a password hash, use:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('yourpassword', 10);
```
