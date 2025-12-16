#!/bin/bash

# Security RAT Modern - Stop Development Servers
# This script stops the backend and frontend servers

echo "Stopping Security RAT Modern development servers..."
echo ""

# Stop backend
BACKEND_PID=$(pgrep -f "node.*apps/backend")
if [ -n "$BACKEND_PID" ]; then
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID
    wait $BACKEND_PID 2>/dev/null
    echo "✓ Backend stopped"
else
    echo "Backend is not running"
fi

# Stop frontend
FRONTEND_PID=$(pgrep -f "vite.*apps/frontend")
if [ -n "$FRONTEND_PID" ]; then
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    wait $FRONTEND_PID 2>/dev/null
    echo "✓ Frontend stopped"
else
    echo "Frontend is not running"
fi

echo ""
echo "All servers stopped successfully!"
