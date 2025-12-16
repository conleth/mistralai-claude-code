#!/bin/bash

# Build all packages in the correct order

set -e

echo "Building all packages..."

# Build types first (no dependencies)
echo "Building @security-rat/types..."
cd packages/types
npm run build

# Build standards (depends on types)
echo "Building @security-rat/standards..."
cd ../standards
npm run build

# Build rules-engine (depends on types and standards)
echo "Building @security-rat/rules-engine..."
cd ../rules-engine
npm run build

# Build questionnaire (depends on types)
echo "Building @security-rat/questionnaire..."
cd ../questionnaire
npm run build

# Build integrations (depends on types)
echo "Building @security-rat/integrations..."
cd ../integrations
npm run build

# Build backend (depends on all packages)
echo "Building @security-rat/backend..."
cd ../../apps/backend
npm run build

echo "All packages built successfully!"
