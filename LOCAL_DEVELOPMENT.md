# Local Development Guide

This guide provides everything you need to get started with local development of Security RAT Modern.

## Quick Start

### One-Click Setup

```bash
# Start everything with one command
./start-dev.sh
```

This script will:
1. Check prerequisites
2. Install dependencies (if needed)
3. Setup the database
4. Start backend and frontend servers
5. Display access information

### Manual Setup

If you prefer to start services manually:

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

## Using the Start/Stop Scripts

### Start Development

```bash
./start-dev.sh
```

**What it does:**
- Checks Node.js version (requires >= 20.0.0)
- Installs dependencies if needed
- Sets up database automatically
- Starts backend on port 3000
- Starts frontend on port 5173
- Waits for services to be ready
- Displays access information

### Stop Development

```bash
./stop-dev.sh
```

**What it does:**
- Stops backend server
- Stops frontend server
- Cleans up processes

## Access Information

Once started, you can access:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Backend Health Check**: `http://localhost:3000/health`

## Test Credentials

For testing login functionality:

- **Email**: `test@example.com`
- **Password**: `password123`

## Database

The application uses SQLite for development. The database file is located at:

```
apps/backend/data/security-rat.db
```

### Database Setup

The database is automatically set up when you run `./start-dev.sh`. If you need to manually set it up:

```bash
./tools/setup-db.sh
```

### Database Verification

To check database status:

```bash
./tools/db-check.sh
```

## Running Tests

### Unit Tests

```bash
cd apps/frontend
npm test
```

### End-to-End Tests

First install Playwright browsers:

```bash
cd apps/frontend
npx playwright install
```

Then run tests:

```bash
npm run test:e2e
```

### Test Modes

- **Headless** (default): `npm run test:e2e`
- **Visible browser**: `npm run test:e2e:headed`
- **Debug mode**: `npm run test:e2e:debug`

## Development Workflow

### 1. Code Changes

- **Backend**: `apps/backend/src/`
- **Frontend**: `apps/frontend/src/`
- **Packages**: `packages/*/src/`

### 2. Build

```bash
# Build all packages
npm run build

# Or build specific package
cd packages/types
npm run build
```

### 3. Restart Servers

After code changes, restart the servers:

```bash
./stop-dev.sh
./start-dev.sh
```

Or manually restart each service.

## Troubleshooting

### Server Not Starting

**Check logs:**
```bash
# Backend logs
cat /tmp/backend.log

# Frontend logs
cat /tmp/frontend.log
```

### Port Conflicts

**Check if ports are in use:**
```bash
lsof -i :3000  # Backend
lsof -i :5173 # Frontend
```

**Kill conflicting processes:**
```bash
kill $(lsof -t -i :3000)
kill $(lsof -t -i :5173)
```

### Database Issues

**Recreate database:**
```bash
rm apps/backend/data/security-rat.db
./tools/setup-db.sh
```

### Dependency Issues

**Reinstall dependencies:**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

## Project Structure

```
/
├── apps/
│   ├── backend/      # Fastify API server
│   └── frontend/     # React frontend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── rules-engine/ # Requirement filtering logic
│   ├── standards/    # OWASP ASVS/SPVS data
│   ├── questionnaire/ # Questionnaire logic
│   └── integrations/ # Jira/Rally adapters
├── tools/            # Development tools
└── docs/             # Documentation
```

## Useful Commands

### Backend

```bash
cd apps/backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run typecheck    # Type checking
npm test             # Run tests
```

### Frontend

```bash
cd apps/frontend
npm run dev          # Start Vite dev server
npm run build        # Build production
npm run typecheck    # Type checking
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

### Packages

```bash
cd packages/types
npm run build        # Build package
npm test             # Run tests
```

## Environment Variables

### Backend

- `JWT_SECRET` - Secret for JWT tokens (default: `supersecret`)
- `PORT` - Port number (default: `3000`)

### Frontend

- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:3000`)

## Browser Support

The application is tested on:
- Chrome/Chromium
- Firefox
- Safari/WebKit

## Documentation

- **Database**: `DATABASE_SETUP.md`
- **Testing**: `TESTING_LOGIN_GUIDE.md`
- **Docker**: `DOCKER_SETUP_SUMMARY.md`
- **API**: See backend source code for endpoint documentation

## Need Help?

1. **Check logs** for specific errors
2. **Review this guide** for common issues
3. **Check documentation files** for detailed information
4. **Try restarting servers** after code changes
5. **Verify dependencies** are installed correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

See `LICENSE` file for licensing information.
