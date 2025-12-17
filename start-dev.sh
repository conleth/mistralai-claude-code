#!/bin/bash

# Security RAT Modern - Local Development Startup Script
# This script sets up and starts the complete development environment

set -e

echo "=========================================="
echo "Security RAT Modern - Local Development"
echo "=========================================="
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js (>=20.0.0) and npm (>=10.0.0)"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "❌ Error: Node.js $NODE_VERSION is too old"
    echo "Please upgrade to Node.js >= 20.0.0"
    exit 1
fi

echo "✓ Node.js $NODE_VERSION (>= 20.0.0)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
    echo "✓ Root dependencies installed"
    echo ""
fi

# Setup database
if [ ! -f "apps/backend/data/security-rat.db" ]; then
    echo "Setting up database..."
    if [ -f "tools/setup-db.sh" ]; then
        ./tools/setup-db.sh
    else
        echo "Database setup script not found, creating database manually..."
        cd apps/backend
        npm run build
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
        cd ..
    fi
    echo "✓ Database setup complete"
    echo ""
fi

# Start backend in background
echo "Starting backend server..."
cd apps/backend
if [ ! -f "dist/index.js" ]; then
    echo "Building backend..."
    npm run build
fi

# Check if backend is already running
if ! pgrep -f "node.*apps/backend" > /dev/null; then
    nohup npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    echo "Logs: /tmp/backend.log"
else
    echo "Backend is already running"
fi

# Wait for backend to start
MAX_RETRIES=30
RETRY_DELAY=1
RETRY_COUNT=0
BACKEND_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep $RETRY_DELAY
    echo -n "."
done

echo ""

if [ "$BACKEND_READY" = true ]; then
    echo "✓ Backend server is ready at http://localhost:3000"
else
    echo "⚠️ Backend server may not have started properly"
    echo "Check logs: /tmp/backend.log"
fi
echo ""

# Start frontend
echo "Starting frontend server..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if frontend is already running
if ! pgrep -f "vite.*apps/frontend" > /dev/null; then
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
    echo "Logs: /tmp/frontend.log"
else
    echo "Frontend is already running"
fi

# Wait for frontend to start
MAX_RETRIES=30
RETRY_DELAY=1
RETRY_COUNT=0
FRONTEND_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep $RETRY_DELAY
    echo -n "."
done

echo ""

if [ "$FRONTEND_READY" = true ]; then
    echo "✓ Frontend server is ready at http://localhost:5173"
else
    echo "⚠️ Frontend server may not have started properly"
    echo "Check logs: /tmp/frontend.log"
fi
echo ""

# Display summary
echo "=========================================="
echo "Development Environment is Ready!"
echo "=========================================="
echo ""
echo "📋 Services:"
echo "  Backend API:  http://localhost:3000"
echo "  Frontend:     http://localhost:5173"
echo ""
echo "🔑 Test Credentials:"
echo "  Email:    test@example.com"
echo "  Password: password123"
echo ""
echo "📖 Documentation:"
echo "  Database: DATABASE_SETUP.md"
echo "  Testing:  TESTING_LOGIN_GUIDE.md"
echo ""
echo "🛑 To Stop Servers:"
echo "  kill $(pgrep -f 'node.*apps/backend')"
echo "  kill $(pgrep -f 'vite.*apps/frontend')"
echo ""
echo "=========================================="
