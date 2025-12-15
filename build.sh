#!/bin/bash

# Simple build script - builds packages and apps without Docker

set -e

echo "Building packages and apps..."

# Build packages in order
echo "Building @security-rat/types..."
cd packages/types && npm run build && cd ../..

echo "Building @security-rat/standards..."
cd packages/standards && npm run build && cd ../..

echo "Building @security-rat/rules-engine..."
cd packages/rules-engine && npm run build && cd ../..

echo "Building @security-rat/integrations..."
cd packages/integrations && npm run build && cd ../..

echo "Building @security-rat/questionnaire..."
cd packages/questionnaire && npm run build && cd ../..

echo "Building backend..."
cd apps/backend && npm run build && cd ../..

echo "Building frontend..."
cd apps/frontend && npm run build && cd ../..

echo ""
echo "✅ All builds completed successfully!"
echo ""
echo "Built files are in:"
echo "  - packages/*/dist"
echo "  - apps/backend/dist"
echo "  - apps/frontend/dist"
