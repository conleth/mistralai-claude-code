#!/bin/bash

# Clean all dist directories
echo "Cleaning dist directories..."

find . -name "dist" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true

echo "Dist directories cleaned successfully."
