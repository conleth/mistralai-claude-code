#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root (parent of tools/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Security RAT Modern - Init Check${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Track overall status
ERRORS=0
WARNINGS=0

# Helper functions
error() {
  echo -e "${RED}✗ $1${NC}"
  ((ERRORS++))
}

warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
  ((WARNINGS++))
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
}

info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

section() {
  echo ""
  echo -e "${BLUE}=== $1 ===${NC}"
}

# 1. Check Node.js version
section "Prerequisites"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
  if [ "$NODE_MAJOR" -ge 20 ]; then
    success "Node.js $NODE_VERSION (>= 20.0.0)"
  else
    error "Node.js $NODE_VERSION (requires >= 20.0.0)"
  fi
else
  error "Node.js not found"
fi

# 2. Check npm version
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  NPM_MAJOR=$(echo "$NPM_VERSION" | sed 's/\([0-9]*\).*/\1/')
  if [ "$NPM_MAJOR" -ge 10 ]; then
    success "npm $NPM_VERSION (>= 10.0.0)"
  else
    warning "npm $NPM_VERSION (recommended >= 10.0.0)"
  fi
else
  error "npm not found"
fi

# 3. Check git status
section "Repository Status"
if [ -d .git ]; then
  success "Git repository initialized"
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  info "Current branch: $BRANCH"

  # Check for uncommitted changes
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    warning "Uncommitted changes detected"
  else
    success "Working directory clean"
  fi
else
  error "Not a git repository"
fi

# 4. Validate project structure
section "Project Structure"
EXPECTED_DIRS=(
  "apps/frontend"
  "apps/backend"
  "packages/types"
  "packages/rules-engine"
  "packages/standards"
  "docs"
  "tools"
  ".claude"
)

for dir in "${EXPECTED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    success "$dir/"
  else
    error "Missing directory: $dir/"
  fi
done

# 5. Check required files
section "Required Files"
REQUIRED_FILES=(
  "package.json"
  "tsconfig.json"
  ".gitignore"
  "README.md"
  ".claude/CLAUDE.md"
  ".env.example"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    success "$file"
  else
    error "Missing file: $file"
  fi
done

# Check for .env
if [ -f .env ]; then
  success ".env (configured)"
else
  warning ".env not found (copy from .env.example if needed)"
fi

# 6. Check workspace packages
section "Workspace Packages"
WORKSPACES=(
  "apps/frontend"
  "apps/backend"
  "packages/types"
  "packages/rules-engine"
  "packages/standards"
  "packages/questionnaire"
)

for workspace in "${WORKSPACES[@]}"; do
  if [ -f "$workspace/package.json" ]; then
    PKG_NAME=$(node -p "require('./$workspace/package.json').name" 2>/dev/null || echo "unknown")
    success "$workspace → $PKG_NAME"
  else
    error "$workspace/package.json not found"
  fi
done

# 7. Check implementation files
section "Implementation Files"

IMPLEMENTATION_FILES=(
  "packages/types/src/index.ts"
  "packages/rules-engine/src/index.ts"
  "packages/rules-engine/src/index.test.ts"
  "packages/standards/src/index.ts"
  "packages/standards/src/index.test.ts"
  "packages/questionnaire/src/index.ts"
  "packages/questionnaire/src/index.test.ts"
  "packages/standards/data/asvs-5.0.json"
  "packages/standards/data/spvs-1.0.json"
)

for file in "${IMPLEMENTATION_FILES[@]}"; do
  if [ -f "$file" ]; then
    success "$file"
  else
    error "Missing implementation file: $file"
  fi
done

# 8. Check dependencies
section "Dependencies"
if [ -d node_modules ]; then
  success "Root node_modules exists"

  # Count installed packages
  PKG_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
  info "Installed packages: $PKG_COUNT"
else
  warning "Root node_modules not found (run: npm install)"
fi

# Check if workspace modules are linked
WORKSPACE_MODULES_OK=true
for workspace in "${WORKSPACES[@]}"; do
  if [ ! -d "$workspace/node_modules" ]; then
    WORKSPACE_MODULES_OK=false
    break
  fi
done

if [ "$WORKSPACE_MODULES_OK" = true ]; then
  success "Workspace node_modules linked"
else
  warning "Workspace dependencies may need installation (run: npm install)"
fi

# 8. TypeScript configuration
section "TypeScript"
if [ -f tsconfig.json ]; then
  success "Root tsconfig.json found"

  # Check if typescript is installed
  if [ -f node_modules/.bin/tsc ]; then
    TSC_VERSION=$(node_modules/.bin/tsc --version 2>/dev/null || echo "unknown")
    success "TypeScript compiler: $TSC_VERSION"
  else
    warning "TypeScript compiler not installed (run: npm install)"
  fi
else
  error "tsconfig.json not found"
fi

# 9. Package scripts
section "Available Scripts"
if [ -f package.json ]; then
  SCRIPTS=$(node -p "Object.keys(require('./package.json').scripts || {}).join(', ')" 2>/dev/null || echo "none")
  info "Scripts: $SCRIPTS"
else
  error "Cannot read package.json"
fi

# 10. Summary report
section "Summary"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Project is ready.${NC}"
  echo ""
  echo "Next steps:"
  echo "  npm install          # Install dependencies"
  echo "  npm run typecheck    # Verify TypeScript"
  echo "  npm run dev          # Start development servers"
  EXIT_CODE=0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Checks completed with $WARNINGS warning(s)${NC}"
  echo "  The project should work, but review warnings above."
  EXIT_CODE=0
else
  echo -e "${RED}✗ Checks failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo "  Please fix errors before proceeding."
  EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo ""

# Create a state snapshot file
STATE_FILE="$PROJECT_ROOT/.init-state"
cat > "$STATE_FILE" << EOF
# Generated by tools/init.sh at $(date -u +"%Y-%m-%dT%H:%M:%SZ")
NODE_VERSION=$NODE_VERSION
NPM_VERSION=$NPM_VERSION
BRANCH=$BRANCH
ERRORS=$ERRORS
WARNINGS=$WARNINGS
LAST_CHECK=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

info "State snapshot saved to .init-state"
echo ""

exit $EXIT_CODE
